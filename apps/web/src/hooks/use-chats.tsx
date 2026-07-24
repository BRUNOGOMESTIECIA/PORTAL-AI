import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query, getDocs, writeBatch 
} from 'firebase/firestore';
import { MockChatSession, MOCK_CHAT_SESSIONS } from '../mocks/data';
import { toast } from 'sonner';

interface ChatsContextValue {
  chats: MockChatSession[];
  isLoading: boolean;
  createChat: (chat: MockChatSession) => Promise<void>;
  updateChat: (id: string, updates: Partial<MockChatSession>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<MockChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'chat_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: MockChatSession[] = [];
      snapshot.forEach((doc) => {
        chatsData.push(doc.data() as MockChatSession);
      });
      // Sort in memory by descending createdAt
      chatsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setChats(chatsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao carregar chats:", error);
      setIsLoading(false);
      // Fallback para mock local em caso de erro de permissão
      if (chats.length === 0) {
        setChats([...MOCK_CHAT_SESSIONS]);
      }
    });

    return () => unsubscribe();
  }, [chats.length]);

  const createChat = useCallback(async (chat: MockChatSession) => {
    try {
      await setDoc(doc(db, 'chat_sessions', chat.id), chat);
    } catch (error) {
      console.error("Erro ao criar chat:", error);
      throw error;
    }
  }, []);

  const updateChat = useCallback(async (id: string, updates: Partial<MockChatSession>) => {
    try {
      await updateDoc(doc(db, 'chat_sessions', id), updates);
    } catch (error) {
      console.error("Erro ao atualizar chat:", error);
      throw error;
    }
  }, []);

  const seedMockData = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'chat_sessions'));
      if (snapshot.empty) {
        toast.loading('Copiando chats de teste para o Firebase...', { id: 'seed_chats' });
        const batch = writeBatch(db);
        MOCK_CHAT_SESSIONS.forEach((chat) => {
          const docRef = doc(db, 'chat_sessions', chat.id);
          batch.set(docRef, chat);
        });
        await batch.commit();
        toast.success('Chats de teste copiados com sucesso!', { id: 'seed_chats' });
      }
    } catch (error) {
      console.error("Erro ao fazer seed de chats:", error);
    }
  }, []);

  return (
    <ChatsContext.Provider value={{ chats, isLoading, createChat, updateChat, seedMockData }}>
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatsProvider');
  }
  return context;
}
