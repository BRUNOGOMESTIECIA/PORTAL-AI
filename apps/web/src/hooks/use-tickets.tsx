import { useState, useEffect, useCallback, createContext, useContext } from 'react';
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

  useEffect(() => {
    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: MockTicket[] = [];
      snapshot.forEach((doc) => {
        ticketsData.push(doc.data() as MockTicket);
      });
      // Sort in memory by descending createdAt (newest first)
      ticketsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTickets(ticketsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao carregar tickets:", error);
      setIsLoading(false);
      setUseFallback(true);
      // Fallback para mock local em caso de erro de permissão (banco não criado)
      if (tickets.length === 0) {
        setTickets([...MOCK_TICKETS]);
      }
    });

    return () => unsubscribe();
  }, [tickets.length]); // intentionally using tickets.length to avoid infinite loops on reference changes

  const createTicket = useCallback(async (ticket: MockTicket) => {
    if (useFallback) {
      MOCK_TICKETS.unshift(ticket);
      setTickets(prev => [ticket, ...prev]);
      return;
    }
    try {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      MOCK_TICKETS.unshift(ticket);
      setTickets(prev => [ticket, ...prev]);
    }
  }, [useFallback]);

  const updateTicket = useCallback(async (id: string, updates: Partial<MockTicket>) => {
    if (useFallback) {
      const idx = MOCK_TICKETS.findIndex(t => t.id === id);
      if (idx > -1) MOCK_TICKETS[idx] = { ...MOCK_TICKETS[idx], ...updates } as MockTicket;
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } as MockTicket : t));
      return;
    }
    try {
      await updateDoc(doc(db, 'tickets', id), updates);
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      const idx = MOCK_TICKETS.findIndex(t => t.id === id);
      if (idx > -1) MOCK_TICKETS[idx] = { ...MOCK_TICKETS[idx], ...updates } as MockTicket;
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } as MockTicket : t));
    }
  }, [useFallback]);

  const seedMockData = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tickets'));
      if (snapshot.empty) {
        toast.loading('Copiando dados iniciais para o Firebase...', { id: 'seed_tickets' });
        const batch = writeBatch(db);
        MOCK_TICKETS.forEach((ticket) => {
          const docRef = doc(db, 'tickets', ticket.id);
          batch.set(docRef, ticket);
        });
        await batch.commit();
        toast.success('Chamados de teste copiados com sucesso!', { id: 'seed_tickets' });
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
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
}
