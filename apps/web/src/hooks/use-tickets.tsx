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
  // Inicializa os tickets com o localStorage ou com MOCK_TICKETS para que o portal nunca fique zerado
  const [tickets, setTickets] = useState<MockTicket[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_TICKETS;
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

  useEffect(() => {
    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: MockTicket[] = [];
      snapshot.forEach((docSnap) => {
        ticketsData.push(docSnap.data() as MockTicket);
      });
      ticketsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (ticketsData.length > 0) {
        saveFallbackTickets(ticketsData);
      } else {
        // Se o banco estiver vazio, usa os dados padrão
        saveFallbackTickets(MOCK_TICKETS);
      }
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
