import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query 
} from 'firebase/firestore';
import { MockChatSession, MOCK_CHATS } from '../mocks/data';
import { redactSensitiveData } from '../lib/redaction';
import { apiClient } from '../lib/api-client';
import { getSocket, joinTenantRoom } from '../lib/socket';

interface ChatsContextValue {
  chats: MockChatSession[];
  isLoading: boolean;
  createChat: (chat: MockChatSession) => Promise<void>;
  updateChat: (id: string, updates: Partial<MockChatSession>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

/**
 * BUG-14 FIX: Mescla e ordena mensagens cronologicamente sem duplicatas para eliminar Race Conditions
 */
export function mergeAndSortMessages(existing: any[] = [], incoming: any[] = []): any[] {
  const map = new Map<string, any>();

  existing.forEach((m) => {
    const key = m.id || `${m.senderName}_${m.timestamp || m.createdAt || ''}_${m.body}`;
    map.set(key, m);
  });

  incoming.forEach((m) => {
    const key = m.id || `${m.senderName}_${m.timestamp || m.createdAt || ''}_${m.body}`;
    if (!map.has(key)) {
      map.set(key, m);
    } else {
      map.set(key, { ...map.get(key), ...m });
    }
  });

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  return merged;
}

/**
 * HOOK DE GERENCIAMENTO DE CHATS (TEMPO REAL VIA SOCKET.IO + API REST + MOCK FALLBACK)
 * 
 * Gerencia as conversas ao vivo.
 * Conectado ao `Socket.io` para receber mensagens e atualizações de status em tempo real
 * emitidas pelo `WsGateway` da API NestJS.
 */
export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<MockChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_chats');
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
  const fallbackChatsRef = useRef<MockChatSession[]>(chats);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const saveFallbackChats = useCallback((newChats: MockChatSession[]) => {
    fallbackChatsRef.current = newChats;
    setChats(newChats);
    try {
      localStorage.setItem('portal_fallback_chats', JSON.stringify(newChats));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }, []);

  // Inicializa a escuta via Socket.io em tempo real com cleanup correto
  useEffect(() => {
    let socket: any = null;

    const handleNewMessage = (msgData: any) => {
      console.info('[Socket.io] Nova mensagem recebida via WebSocket:', msgData);
      const currentList = [...fallbackChatsRef.current];
      const idx = currentList.findIndex(c => c.id === msgData.sessionId);
      if (idx > -1) {
        const currentMsgs = currentList[idx].messages || [];
        const newMsgObj = {
          id: msgData.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          senderName: msgData.senderName || 'Atendente',
          body: redactSensitiveData(msgData.body || ''),
          timestamp: msgData.createdAt || new Date().toISOString(),
          isAgent: msgData.senderType === 'agent',
        };

        currentList[idx] = {
          ...currentList[idx],
          messages: mergeAndSortMessages(currentMsgs, [newMsgObj])
        };
        saveFallbackChats(currentList);
      }
    };

    const handleSessionStatus = (statusData: any) => {
      console.info('[Socket.io] Status de sessão alterado:', statusData);
    };

    try {
      socket = getSocket();
      joinTenantRoom();

      socket.on('chat:message:new', handleNewMessage);
      socket.on('chat:session:status', handleSessionStatus);
    } catch (err) {
      console.info('[Socket.io] Não foi possível conectar ao WsGateway:', err);
    }

    // BUG-04 FIX: Cleanup de listeners para evitar memory leak e mensagens duplicadas
    return () => {
      if (socket) {
        socket.off('chat:message:new', handleNewMessage);
        socket.off('chat:session:status', handleSessionStatus);
      }
    };
  }, [saveFallbackChats]);

  // Sincronização BroadcastChannel entre abas locais
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

  // Tenta carregar sessões de chat via API REST NestJS primeiro
  const fetchChatsFromApi = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>('/chat-external/sessions');
      if (Array.isArray(data) && data.length > 0) {
        const formatted: MockChatSession[] = data.map((c: any) => ({
          id: c.id,
          clientName: c.requesterName || 'Cliente',
          clientEmail: c.requesterEmail || '',
          status: c.status || 'waiting',
          agentName: c.agentName || null,
          queue: c.queueName || 'Chat ao vivo',
          waitingMinutes: c.waitingMinutes ?? 0,
          messages: (c.messages || []).map((m: any) => ({
            id: m.id,
            senderName: m.senderName || 'Usuário',
            body: redactSensitiveData(m.body || ''),
            timestamp: m.createdAt || new Date().toISOString(),
            isAgent: m.senderType === 'agent',
          })),
          createdAt: c.createdAt || new Date().toISOString(),
          ticketId: c.ticketId,
          rating: c.rating,
          ratingComment: c.ratingComment
        }));
        saveFallbackChats(formatted);
        setIsLoading(false);
        return true;
      }
    } catch (err: any) {
      console.info('[Chat API] Servidor REST em standby. Usando Firestore/localStorage.', err?.message);
    }
    return false;
  }, [saveFallbackChats]);

  // Escuta diretamente na coleção 'chat_sessions' do Firestore em tempo real como fallback
  useEffect(() => {
    fetchChatsFromApi();

    const q = query(collection(db, 'chat_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreChats: MockChatSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdIso = data.createdAt || new Date().toISOString();
        const createdMs = new Date(createdIso).getTime();
        const nowMs = Date.now();
        const calcWaitingMins = Math.max(0, Math.floor((nowMs - createdMs) / 60000));

        firestoreChats.push({
          id: docSnap.id,
          clientName: data.clientName || data.clientEmail?.split('@')[0] || 'Cliente',
          clientEmail: data.clientEmail || data.clientId || data.requesterId || '',
          status: data.status || 'waiting',
          agentName: data.agentName || null,
          queue: data.queue || 'Chat ao vivo',
          waitingMinutes: data.status === 'waiting' ? calcWaitingMins : (data.waitingMinutes ?? 0),
          messages: data.messages || [],
          createdAt: createdIso,
          ticketId: data.ticketId,
          rating: data.rating,
          ratingComment: data.ratingComment
        });
      });

      firestoreChats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveFallbackChats(firestoreChats);
      setIsLoading(false);
    }, (error) => {
      console.warn("Aviso Firestore Chats:", error?.message);
      setIsLoading(false);
      const saved = localStorage.getItem('portal_fallback_chats');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setChats(parsed);
        } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, [fetchChatsFromApi, saveFallbackChats]);

  function sanitizeMessages(messages?: any[]): any[] | undefined {
    if (!messages) return undefined;
    return messages.map((m) => ({
      ...m,
      body: redactSensitiveData(m.body || ''),
    }));
  }

  const createChat = useCallback(async (chat: MockChatSession) => {
    const sanitizedChat = {
      ...chat,
      messages: sanitizeMessages(chat.messages) || [],
    };

    const updated = [sanitizedChat, ...fallbackChatsRef.current];
    saveFallbackChats(updated);
    channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: updated });

    // Envia via API NestJS real
    try {
      await apiClient.post('/chat-external/sessions', {
        queueId: chat.queue || 'default',
        requesterId: chat.clientEmail,
      });
      console.info('[Chat API] Sessão criada no banco de dados real com sucesso!');
    } catch (err: any) {
      console.info('[Chat API] Falha ao enviar para API REST (salvo em fallback):', err?.message);
    }

    try {
      await setDoc(doc(db, 'chat_sessions', sanitizedChat.id), sanitizedChat);
    } catch (error) {
      console.warn("Erro ao salvar chat no Firestore:", error);
    }
  }, [saveFallbackChats]);

  const updateChat = useCallback(async (id: string, updates: Partial<MockChatSession>) => {
    const sanitizedUpdates = {
      ...updates,
      ...(updates.messages ? { messages: sanitizeMessages(updates.messages) } : {}),
    };

    const currentList = [...fallbackChatsRef.current];
    const idx = currentList.findIndex(c => c.id === id);
    if (idx > -1) {
      const mergedMsgs = updates.messages
        ? mergeAndSortMessages(currentList[idx].messages || [], sanitizeMessages(updates.messages) || [])
        : currentList[idx].messages;

      currentList[idx] = {
        ...currentList[idx],
        ...sanitizedUpdates,
        messages: mergedMsgs,
      };
      saveFallbackChats(currentList);
      channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: currentList });
    }

    // Tenta atualizar via API NestJS real se houver nova mensagem
    if (updates.messages && updates.messages.length > 0) {
      const lastMsg = updates.messages[updates.messages.length - 1];
      try {
        await apiClient.post(`/chat-external/sessions/${id}/messages`, {
          body: lastMsg.body,
          senderType: (lastMsg as any).isAgent ? 'agent' : 'user',
        });
      } catch (err: any) {
        console.info('[Chat API] Mensagem enviada em modo fallback:', err?.message);
      }
    }

    try {
      await updateDoc(doc(db, 'chat_sessions', id), sanitizedUpdates);
    } catch (error) {
      console.warn("Erro ao atualizar chat no Firestore:", error);
    }
  }, [saveFallbackChats]);

  const seedMockData = useCallback(async () => {}, []);

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
