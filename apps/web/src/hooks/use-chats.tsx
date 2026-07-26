import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
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
  const [useFallback, setUseFallback] = useState(false);
  const fallbackChatsRef = useRef<MockChatSession[]>([]);

  // Configura BroadcastChannel para sincronização local entre abas se Firebase falhar
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('chat_sync_fallback');
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'SYNC_CHATS') {
        fallbackChatsRef.current = event.data.payload;
        setChats([...fallbackChatsRef.current]);
      }
    };
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'chat_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: MockChatSession[] = [];
      snapshot.forEach((doc) => {
        chatsData.push(doc.data() as MockChatSession);
      });
      chatsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setChats(chatsData);
      setIsLoading(false);
      setUseFallback(false);
    }, (error) => {
      console.error("Erro ao carregar chats (Firestore):", error);
      setIsLoading(false);
      setUseFallback(true);
      // Usar memória local se Firebase bloquear
      setChats([...fallbackChatsRef.current]);
    });

    return () => unsubscribe();
  }, [chats.length]);

  const createChat = useCallback(async (chat: MockChatSession) => {
    if (useFallback) {
      fallbackChatsRef.current = [chat, ...fallbackChatsRef.current];
      setChats([...fallbackChatsRef.current]);
      channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: fallbackChatsRef.current });
      return;
    }
    try {
      await setDoc(doc(db, 'chat_sessions', chat.id), chat);
    } catch (error) {
      console.error("Erro ao criar chat (Firestore falhou, usando fallback):", error);
      setUseFallback(true);
      fallbackChatsRef.current = [chat, ...chats];
      setChats([...fallbackChatsRef.current]);
      channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: fallbackChatsRef.current });
    }
  }, [useFallback, chats]);

  const updateChat = useCallback(async (id: string, updates: Partial<MockChatSession>) => {
    if (useFallback) {
      const idx = fallbackChatsRef.current.findIndex(c => c.id === id);
      if (idx > -1) {
        fallbackChatsRef.current[idx] = { ...fallbackChatsRef.current[idx], ...updates };
        setChats([...fallbackChatsRef.current]);
        channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: fallbackChatsRef.current });
      }
      return;
    }
    try {
      await updateDoc(doc(db, 'chat_sessions', id), updates);
    } catch (error) {
      console.error("Erro ao atualizar chat (Firestore falhou, usando fallback):", error);
      setUseFallback(true);
      
      // Inicializar fallbackChatsRef com o estado atual caso ainda não tenha sido
      if (fallbackChatsRef.current.length === 0 && chats.length > 0) {
        fallbackChatsRef.current = [...chats];
      }
      
      const idx = fallbackChatsRef.current.findIndex(c => c.id === id);
      if (idx > -1) {
        fallbackChatsRef.current[idx] = { ...fallbackChatsRef.current[idx], ...updates };
        setChats([...fallbackChatsRef.current]);
        channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: fallbackChatsRef.current });
      }
    }
  }, [useFallback, chats]);

  const seedMockData = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'chat_sessions'));
      if (snapshot.empty) {
        toast.loading('Copiando chats...', { id: 'seed_chats' });
        const batch = writeBatch(db);
        MOCK_CHAT_SESSIONS.forEach((chat) => {
          batch.set(doc(db, 'chat_sessions', chat.id), chat);
        });
        await batch.commit();
        toast.success('Pronto!', { id: 'seed_chats' });
      }
    } catch (error) {
      console.error("Erro no seed:", error);
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
  if (!context) throw new Error('useChats must be used within a ChatsProvider');
  return context;
}
