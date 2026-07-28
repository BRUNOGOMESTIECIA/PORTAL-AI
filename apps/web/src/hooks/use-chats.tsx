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
  const [chats, setChats] = useState<MockChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_chats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return MOCK_CHAT_SESSIONS;
    } catch {
      return MOCK_CHAT_SESSIONS;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const fallbackChatsRef = useRef<MockChatSession[]>(chats);

  const saveFallbackChats = useCallback((newChats: MockChatSession[]) => {
    fallbackChatsRef.current = newChats;
    setChats(newChats);
    try {
      localStorage.setItem('portal_fallback_chats', JSON.stringify(newChats));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }, []);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('chat_sync_fallback');
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'SYNC_CHATS') {
          fallbackChatsRef.current = event.data.payload;
          setChats([...fallbackChatsRef.current]);
          localStorage.setItem('portal_fallback_chats', JSON.stringify(event.data.payload));
        }
      };
    } catch (e) {}
    return () => channelRef.current?.close();
  }, []);

  // Escuta no Firestore com combinações para que nenhum chat suma
  useEffect(() => {
    const q = query(collection(db, 'chat_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreChats: MockChatSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreChats.push({
          id: docSnap.id,
          clientName: data.clientName || data.clientEmail?.split('@')[0] || 'Cliente',
          clientEmail: data.clientEmail || data.clientId || data.requesterId || '',
          status: data.status || 'waiting',
          agentName: data.agentName || null,
          queue: data.queue || 'Chat ao vivo',
          waitingMinutes: data.waitingMinutes ?? 0,
          messages: data.messages || [],
          createdAt: data.createdAt || new Date().toISOString(),
          ticketId: data.ticketId
        });
      });

      // Combina chats do banco com os de demonstração para que NENHUM suma
      const chatMap = new Map<string, MockChatSession>();
      MOCK_CHAT_SESSIONS.forEach(c => chatMap.set(c.id, c));
      firestoreChats.forEach(c => chatMap.set(c.id, c));

      const combined = Array.from(chatMap.values());
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveFallbackChats(combined);
      setIsLoading(false);
      setUseFallback(false);
    }, (error) => {
      console.info("Firestore usando persistence local para chats:", error?.message);
      setIsLoading(false);
      setUseFallback(true);
      const saved = localStorage.getItem('portal_fallback_chats');
      if (saved) {
        setChats(JSON.parse(saved));
      } else {
        saveFallbackChats(MOCK_CHAT_SESSIONS);
      }
    });

    return () => unsubscribe();
  }, [saveFallbackChats]);

  const createChat = useCallback(async (chat: MockChatSession) => {
    const updated = [chat, ...fallbackChatsRef.current];
    saveFallbackChats(updated);
    channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: updated });

    if (!useFallback) {
      try {
        await setDoc(doc(db, 'chat_sessions', chat.id), chat);
      } catch (error) {
        console.warn("Erro ao salvar chat no Firestore, mantido no localStorage:", error);
        setUseFallback(true);
      }
    }
  }, [useFallback, saveFallbackChats]);

  const updateChat = useCallback(async (id: string, updates: Partial<MockChatSession>) => {
    const currentList = [...fallbackChatsRef.current];
    const idx = currentList.findIndex(c => c.id === id);
    if (idx > -1) {
      currentList[idx] = { ...currentList[idx], ...updates };
      saveFallbackChats(currentList);
      channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: currentList });
    }

    if (!useFallback) {
      try {
        await updateDoc(doc(db, 'chat_sessions', id), updates);
      } catch (error) {
        console.warn("Erro ao atualizar chat no Firestore, mantido no localStorage:", error);
        setUseFallback(true);
      }
    }
  }, [useFallback, saveFallbackChats]);

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
