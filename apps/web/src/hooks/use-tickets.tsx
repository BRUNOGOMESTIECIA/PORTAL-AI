import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query, getDocs, writeBatch 
} from 'firebase/firestore';
import { MockTicket, MOCK_TICKETS } from '../mocks/data';
import { toast } from 'sonner';

interface TicketsContextValue {
  tickets: MockTicket[];
  isLoading: boolean;
  createTicket: (ticket: MockTicket) => Promise<void>;
  updateTicket: (id: string, updates: Partial<MockTicket>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<MockTicket[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return MOCK_TICKETS;
    } catch {
      return MOCK_TICKETS;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const fallbackTicketsRef = useRef<MockTicket[]>(tickets);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const saveFallbackTickets = useCallback((newTickets: MockTicket[]) => {
    fallbackTicketsRef.current = newTickets;
    setTickets(newTickets);
    try {
      localStorage.setItem('portal_fallback_tickets', JSON.stringify(newTickets));
    } catch (e) {
      console.warn('Não foi possível salvar tickets no localStorage:', e);
    }
  }, []);

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

  // Carrega em tempo real do Firestore e combina para que NENHUM ticket suma
  useEffect(() => {
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
          parentTicketId: data.parentTicketId
        });
      });

      // Combina os tickets do banco com os de demonstração para garantir exibição total
      const ticketMap = new Map<string, MockTicket>();
      MOCK_TICKETS.forEach(t => ticketMap.set(t.id, t));
      firestoreTickets.forEach(t => ticketMap.set(t.id, t));

      const combined = Array.from(ticketMap.values());
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveFallbackTickets(combined);
      setIsLoading(false);
      setUseFallback(false);
    }, (error) => {
      console.info("Firestore usando persistence local para tickets:", error?.message);
      setIsLoading(false);
      setUseFallback(true);
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        setTickets(JSON.parse(saved));
      } else {
        saveFallbackTickets(MOCK_TICKETS);
      }
    });

    return () => unsubscribe();
  }, [saveFallbackTickets]);

  const createTicket = useCallback(async (ticket: MockTicket) => {
    const updated = [ticket, ...fallbackTicketsRef.current];
    saveFallbackTickets(updated);
    channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: updated });

    if (!useFallback) {
      try {
        await setDoc(doc(db, 'tickets', ticket.id), ticket);
      } catch (error) {
        console.warn("Erro ao salvar ticket no Firestore, mantido no localStorage:", error);
        setUseFallback(true);
      }
    }
  }, [useFallback, saveFallbackTickets]);

  const updateTicket = useCallback(async (id: string, updates: Partial<MockTicket>) => {
    const currentList = [...fallbackTicketsRef.current];
    const idx = currentList.findIndex(t => t.id === id);
    if (idx > -1) {
      currentList[idx] = { ...currentList[idx], ...updates } as MockTicket;
      saveFallbackTickets(currentList);
      channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: currentList });
    }

    if (!useFallback) {
      try {
        await updateDoc(doc(db, 'tickets', id), updates);
      } catch (error) {
        console.warn("Erro ao atualizar ticket no Firestore, mantido no localStorage:", error);
        setUseFallback(true);
      }
    }
  }, [useFallback, saveFallbackTickets]);

  const seedMockData = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tickets'));
      if (snapshot.empty) {
        toast.loading('Copiando tickets...', { id: 'seed_tickets' });
        const batch = writeBatch(db);
        MOCK_TICKETS.forEach((ticket) => {
          batch.set(doc(db, 'tickets', ticket.id), ticket);
        });
        await batch.commit();
        toast.success('Pronto!', { id: 'seed_tickets' });
      }
    } catch (error) {
      console.error("Erro no seed de tickets:", error);
    }
  }, []);

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
