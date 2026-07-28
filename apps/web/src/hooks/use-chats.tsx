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
  // Inicializa os chats reais (sem carregar os chats fictícios de teste por padrão)
  const [chats, setChats] = useState<MockChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_chats');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filtra para remover os chats fictícios antigos de demonstração
        return Array.isArray(parsed) ? parsed.filter((c: any) => !['ch_juliana', 'ch_mariana', 'ch_paulo', 'ch_rafael'].includes(c.id)) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const fallbackChatsRef = useRef<MockChatSession[]>(chats);

  // Função para sincronizar o estado local e persistir no localStorage
  const saveFallbackChats = useCallback((newChats: MockChatSession[]) => {
    fallbackChatsRef.current = newChats;
    setChats(newChats);
    try {
      localStorage.setItem('portal_fallback_chats', JSON.stringify(newChats));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }, []);

  // Configura BroadcastChannel para sincronização instantânea entre abas
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
    } catch (e) {
      console.warn('BroadcastChannel não suportado neste navegador:', e);
    }
    return () => channelRef.current?.close();
  }, []);

  // Escuta no Firestore com fallback automático no localStorage (sem resetar no F5)
  useEffect(() => {
    const q = query(collection(db, 'chat_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: MockChatSession[] = [];
      snapshot.forEach((docSnap) => {
        chatsData.push(docSnap.data() as MockChatSession);
      });
      chatsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (chatsData.length > 0) {
        saveFallbackChats(chatsData);
      }
      setIsLoading(false);
      setUseFallback(false);
    }, (error) => {
      console.info("Firestore usando persistence local para os chats:", error?.message);
      setIsLoading(false);
      setUseFallback(true);
      // Carrega do localStorage se Firestore não responder
      const saved = localStorage.getItem('portal_fallback_chats');
      if (saved) {
        setChats(JSON.parse(saved));
      }
    });

    return () => unsubscribe();
  }, [saveFallbackChats]);

  const createChat = useCallback(async (chat: MockChatSession) => {
    // Atualiza imediatamente local + localStorage
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
    // Atualiza local + localStorage
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
