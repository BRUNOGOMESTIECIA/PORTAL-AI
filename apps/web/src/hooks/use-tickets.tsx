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
  const [tickets, setTickets] = useState<MockTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const fallbackTicketsRef = useRef<MockTicket[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('ticket_sync_fallback');
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'SYNC_TICKETS') {
        fallbackTicketsRef.current = event.data.payload;
        setTickets([...fallbackTicketsRef.current]);
      }
    };
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: MockTicket[] = [];
      snapshot.forEach((doc) => {
        ticketsData.push(doc.data() as MockTicket);
      });
      ticketsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTickets(ticketsData);
      setIsLoading(false);
      setUseFallback(false);
    }, (error) => {
      console.error("Erro ao carregar tickets:", error);
      setIsLoading(false);
      setUseFallback(true);
      setTickets([...fallbackTicketsRef.current]);
    });

    return () => unsubscribe();
  }, [tickets.length]);

  const createTicket = useCallback(async (ticket: MockTicket) => {
    if (useFallback) {
      fallbackTicketsRef.current = [ticket, ...fallbackTicketsRef.current];
      setTickets([...fallbackTicketsRef.current]);
      channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: fallbackTicketsRef.current });
      return;
    }
    try {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      toast.error("Aviso: Conexão com o banco de dados falhou. Usando memória temporária.");
      setUseFallback(true);
      fallbackTicketsRef.current = [ticket, ...tickets];
      setTickets([...fallbackTicketsRef.current]);
      channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: fallbackTicketsRef.current });
    }
  }, [useFallback, tickets]);

  const updateTicket = useCallback(async (id: string, updates: Partial<MockTicket>) => {
    if (useFallback) {
      const idx = fallbackTicketsRef.current.findIndex(t => t.id === id);
      if (idx > -1) {
        fallbackTicketsRef.current[idx] = { ...fallbackTicketsRef.current[idx], ...updates } as MockTicket;
        setTickets([...fallbackTicketsRef.current]);
        channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: fallbackTicketsRef.current });
      }
      return;
    }
    try {
      await updateDoc(doc(db, 'tickets', id), updates);
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      setUseFallback(true);
      if (fallbackTicketsRef.current.length === 0 && tickets.length > 0) {
        fallbackTicketsRef.current = [...tickets];
      }
      const idx = fallbackTicketsRef.current.findIndex(t => t.id === id);
      if (idx > -1) {
        fallbackTicketsRef.current[idx] = { ...fallbackTicketsRef.current[idx], ...updates } as MockTicket;
        setTickets([...fallbackTicketsRef.current]);
        channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: fallbackTicketsRef.current });
      }
    }
  }, [useFallback, tickets]);

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
      console.error("Erro ao fazer seed de tickets:", error);
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
