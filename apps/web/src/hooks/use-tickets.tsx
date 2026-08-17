import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query 
} from 'firebase/firestore';
import { MockTicket, MOCK_TICKETS } from '../mocks/data';
import { apiClient } from '../lib/api-client';
import { formatTicketProtocol } from '../lib/audit-logger';

interface TicketsContextValue {
  tickets: MockTicket[];
  isLoading: boolean;
  createTicket: (ticket: MockTicket) => Promise<void>;
  updateTicket: (id: string, updates: Partial<MockTicket>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

/**
 * HOOK DE GERENCIAMENTO DE TICKETS (CHAMADOS)
 * 
 * Conectado à API NestJS real (Fase 1 de migração REST + SQL).
 * Executa chamadas à API (`GET /tickets`, `POST /tickets`, `PATCH /tickets/:id`)
 * e mantém resiliência via `localStorage` e Firestore.
 */
export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<MockTicket[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const fallbackTicketsRef = useRef<MockTicket[]>(tickets);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const saveFallbackTickets = useCallback((newTickets: MockTicket[]) => {
    // Auto-correção de nome da mesa e limpeza de descrição de bugs
    const sanitizedTickets = newTickets.map((t) => {
      const team = t.team === 'Bub Engenheiros' ? 'Bug Engenheiros' : t.team;
      let description = t.description;

      if (description && description.includes('**Relato do Usuário:**')) {
        let cleanText = description.split('**Relato do Usuário:**')[1] || description;
        if (cleanText.includes('---')) cleanText = cleanText.split('---')[0];
        if (cleanText.includes('**Metadados do Ambiente:**')) cleanText = cleanText.split('**Metadados do Ambiente:**')[0];
        description = cleanText.trim() || description;
      }

      return { ...t, team, description };
    });

    fallbackTicketsRef.current = sanitizedTickets;
    setTickets(sanitizedTickets);
    try {
      localStorage.setItem('portal_fallback_tickets', JSON.stringify(sanitizedTickets));
    } catch (e) {
      console.warn('Não foi possível salvar tickets no localStorage:', e);
    }
  }, []);

  // Sincronização em tempo real local via BroadcastChannel
  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('ticket_sync_fallback');
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'SYNC_TICKETS') {
          fallbackTicketsRef.current = event.data.payload;
          setTickets([...fallbackTicketsRef.current]);
          localStorage.setItem('portal_fallback_tickets', JSON.stringify(event.data.payload));
        }
      };
    } catch (e) {}
    return () => channelRef.current?.close();
  }, []);

  // Tenta carregar tickets da API NestJS real primeiro
  const fetchTicketsFromApi = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>('/tickets');
      if (Array.isArray(data) && data.length > 0) {
        const formatted: MockTicket[] = data.map((t: any) => ({
          id: t.id,
          number: t.number || 1000,
          title: t.title || 'Chamado de Suporte',
          description: t.description || '',
          status: t.status || 'open',
          priority: t.priority || 'medium',
          type: t.type || 'Incidente',
          category: t.category || 'Outros',
          requesterId: t.requester_id || t.requesterId || '',
          requesterName: t.requester_name || t.requesterName || 'Cliente',
          requesterEmail: t.requester_email || t.requesterEmail || '',
          assigneeName: t.assignee_name || t.assigneeName || null,
          team: t.team || null,
          slaFirstResponseDue: t.sla_first_response_due_at || t.createdAt || new Date().toISOString(),
          slaResolutionDue: t.sla_resolution_due_at || t.createdAt || new Date().toISOString(),
          slaFirstResponseMet: t.slaFirstResponseMet ?? true,
          slaResolutionMet: t.slaResolutionMet ?? true,
          source: t.source || 'portal',
          createdAt: t.created_at || t.createdAt || new Date().toISOString(),
          updatedAt: t.updated_at || t.updatedAt || new Date().toISOString(),
          closedAt: t.closed_at || t.closedAt || null,
          tags: t.tags || [],
          comments: t.comments || [],
        }));
        saveFallbackTickets(formatted);
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      console.info('[Tickets API] Servidor REST offline ou sem dados SQL no momento. Usando Firestore/localStorage.', err?.message);
    }
    return false;
  }, [saveFallbackTickets]);

  // Conecta com a API NestJS e mantém listener do Firestore como fallback
  useEffect(() => {
    fetchTicketsFromApi();

    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreTickets: MockTicket[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreTickets.push({
          id: docSnap.id,
          number: data.number || parseInt(docSnap.id.replace(/\D/g, '').slice(-5)) || 1000,
          title: data.title || 'Chamado de Suporte',
          description: data.description || '',
          status: data.status || 'open',
          priority: data.priority || 'medium',
          type: data.type || 'Incidente',
          category: data.category || 'Outros',
          requesterId: data.requesterId || data.requesterEmail || '',
          requesterName: data.requesterName || data.requesterEmail || 'Cliente',
          requesterEmail: data.requesterEmail || data.requesterId || '',
          assigneeName: data.assigneeName || null,
          team: data.team || null,
          slaFirstResponseDue: data.slaFirstResponseDue || data.createdAt || new Date().toISOString(),
          slaResolutionDue: data.slaResolutionDue || data.createdAt || new Date().toISOString(),
          slaFirstResponseMet: data.slaFirstResponseMet ?? true,
          slaResolutionMet: data.slaResolutionMet ?? true,
          source: data.source || 'portal',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
          closedAt: data.closedAt || null,
          tags: data.tags || [],
          comments: data.comments || [],
          rating: data.rating,
          ratingComment: data.ratingComment,
          ratedAt: data.ratedAt,
          parentTicketId: data.parentTicketId
        });
      });

      firestoreTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveFallbackTickets(firestoreTickets);
      setIsLoading(false);
    }, (error) => {
      console.warn("Aviso Firestore Tickets:", error?.message);
      setIsLoading(false);
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setTickets(parsed);
        } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, [fetchTicketsFromApi, saveFallbackTickets]);

  const createTicket = useCallback(async (ticket: MockTicket) => {
    const updated = [ticket, ...fallbackTicketsRef.current];
    saveFallbackTickets(updated);
    channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: updated });

    // 1. Tenta gravar via API NestJS real
    try {
      await apiClient.post('/tickets', {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority?.toUpperCase(),
        source: ticket.source || 'portal',
      });
      console.info('[Tickets API] Ticket gravado no Banco SQL com sucesso!');
    } catch (apiError: any) {
      console.info('[Tickets API] Falha ao enviar para API REST (salvo em fallback):', apiError?.message);
    }

    // 2. Grava no Firestore como fallback
    try {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
    } catch (error) {
      console.warn("Erro ao salvar ticket no Firestore:", error);
    }
  }, [saveFallbackTickets]);

  const updateTicket = useCallback(async (id: string, updates: Partial<MockTicket>) => {
    const cleanId = String(id).replace(/^[#/]+/, '').toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '');
    const currentList = [...fallbackTicketsRef.current];
    const idx = currentList.findIndex(t => {
      const tId = String(t.id || '').toLowerCase();
      const tNumStr = String(t.number || '');
      const tNumDigits = tNumStr.padStart(4, '0');
      const formattedProtocol = formatTicketProtocol(t.number || t.id).replace(/^[#/]+/, '').toLowerCase();

      return (
        t.id === id ||
        tId === cleanId ||
        tNumStr === cleanId ||
        formattedProtocol === cleanId ||
        (cleanDigits.length >= 4 && tNumDigits.length >= 4 && cleanDigits.endsWith(tNumDigits))
      );
    });

    if (idx > -1) {
      const targetTicket = currentList[idx];
      const updatedTicket = { 
        ...targetTicket, 
        ...updates, 
        updatedAt: updates.updatedAt || new Date().toISOString() 
      } as MockTicket;
      
      currentList[idx] = updatedTicket;
      saveFallbackTickets(currentList);
      channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: currentList });

      // 1. Tenta atualizar via API NestJS real
      try {
        await apiClient.patch(`/tickets/${targetTicket.id}`, updates);
        console.info('[Tickets API] Ticket atualizado no Banco SQL com sucesso!');
      } catch (apiError: any) {
        console.info('[Tickets API] Falha ao atualizar via API REST (atualizado em fallback):', apiError?.message);
      }

      // 2. Atualiza no Firestore como fallback usando setDoc com merge: true
      try {
        await setDoc(doc(db, 'tickets', targetTicket.id), updatedTicket, { merge: true });
      } catch (error) {
        console.warn("Erro ao atualizar ticket no Firestore:", error);
      }
    } else {
      console.warn(`[useTickets] Ticket com ID ${id} não localizado na lista.`);
    }
  }, [saveFallbackTickets]);

  const seedMockData = useCallback(async () => {}, []);

  return (
    <TicketsContext.Provider value={{ tickets, isLoading, createTicket, updateTicket, seedMockData }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (!context) throw new Error('useTickets must be used within a TicketsProvider');
  return context;
}
