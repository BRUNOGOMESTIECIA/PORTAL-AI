import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query, getDocs, writeBatch 
} from 'firebase/firestore';
import { MockChatSession, MOCK_CHAT_SESSIONS } from '../mocks/data';
import { toast } from 'sonner';

/**
 * Valores expostos pelo Contexto de Chats.
 */
interface ChatsContextValue {
  chats: MockChatSession[];
  isLoading: boolean;
  createChat: (chat: MockChatSession) => Promise<void>;
  updateChat: (id: string, updates: Partial<MockChatSession>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

/**
 * Provedor Global de Sessões de Chat em Tempo Real.
 * 
 * Escuta as alterações na coleção `chat_sessions` do Firestore e 
 * mantém a lista atualizada em memória. Também fornece métodos para
 * criar, atualizar e injetar dados de teste na base.
 */
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
    });

    return () => unsubscribe();
  }, [chats.length]);

  /**
   * Cria uma nova sessão de chat no banco de dados.
   * @param {MockChatSession} chat - Objeto de chat a ser inserido.
   * @throws Erro caso falhe na comunicação com o banco.
   */
  const createChat = useCallback(async (chat: MockChatSession) => {
    try {
      await setDoc(doc(db, 'chat_sessions', chat.id), chat);
    } catch (error) {
      console.error("Erro ao criar chat:", error);
      throw error;
    }
  }, []);

  /**
   * Atualiza campos específicos de uma sessão de chat existente.
   * Usado para aceitar chats, trocar status, atribuir operador, etc.
   * @param {string} id - ID único da sessão de chat.
   * @param {Partial<MockChatSession>} updates - Objeto com os campos a serem atualizados.
   */
  const updateChat = useCallback(async (id: string, updates: Partial<MockChatSession>) => {
    try {
      await updateDoc(doc(db, 'chat_sessions', id), updates);
    } catch (error) {
      console.error("Erro ao atualizar chat:", error);
      throw error;
    }
  }, []);

  /**
   * Injeta os dados mockados no banco de dados caso ele esteja vazio.
   * Útil apenas para ambiente de demonstração/desenvolvimento.
   */
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

/**
   * Hook customizado para consumir o estado global de sessões de chat.
   * Garante o uso seguro e centralizado dos dados do Firebase.
   * 
   * @returns {ChatsContextValue} Objeto contendo os dados e funções.
   */
export function useChats() {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatsProvider');
  }
  return context;
}
