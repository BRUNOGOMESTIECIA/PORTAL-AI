import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TypingState {
  chatId: string;
  senderRole: 'client' | 'agent';
  senderName: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * Hook para gerenciar e sincronizar o estado "Digitando..." entre abas/portais.
 * Utiliza BroadcastChannel para abas no mesmo contexto (rápido/gratuito)
 * e Firestore para abas em contextos diferentes (ex: Aba Normal vs Anônima).
 */
export function useTypingIndicator(chatId: string | undefined, currentRole: 'client' | 'agent', currentName: string) {
  const [peerTypingState, setPeerTypingState] = useState<{ isTyping: boolean; name: string }>({
    isTyping: false,
    name: '',
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const myTypingStatus = useRef<boolean>(false);
  const myTypingTimeout = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!chatId) return;

    // 1. Ouve via BroadcastChannel (local)
    try {
      channelRef.current = new BroadcastChannel(`typing_channel_${chatId}`);
      channelRef.current.onmessage = (event) => {
        const data: TypingState = event.data;
        if (data.chatId === chatId && data.senderRole !== currentRole) {
          if (data.isTyping) {
            setPeerTypingState({ isTyping: true, name: data.senderName });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setPeerTypingState({ isTyping: false, name: '' });
            }, 3500);
          } else {
            setPeerTypingState({ isTyping: false, name: '' });
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel não suportado');
    }

    // 2. Ouve via Firestore (cross-browser/cross-network)
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(doc(db, 'chat_sessions', chatId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const peerRole = currentRole === 'client' ? 'agent' : 'client';
          const isPeerTyping = data[`isTyping_${peerRole}`];
          const peerName = data[`typingName_${peerRole}`] || '';

          if (isPeerTyping) {
            setPeerTypingState({ isTyping: true, name: peerName });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setPeerTypingState({ isTyping: false, name: '' });
            }, 3500);
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao escutar Firestore para digitação', e);
    }

    return () => {
      channelRef.current?.close();
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [chatId, currentRole]);

  const notifyTyping = useCallback(() => {
    if (!chatId) return;

    // Envia rápido via local broadcast
    try {
      channelRef.current?.postMessage({
        chatId,
        senderRole: currentRole,
        senderName: currentName,
        isTyping: true,
        timestamp: Date.now(),
      });
    } catch (e) {}

    // Envia para Firestore apenas se o status anterior era falso (Throttling)
    if (!myTypingStatus.current) {
      myTypingStatus.current = true;
      try {
        updateDoc(doc(db, 'chat_sessions', chatId), {
          [`isTyping_${currentRole}`]: true,
          [`typingName_${currentRole}`]: currentName,
        });
      } catch (e) {}
    }

    // Auto-reseta após 2.5s sem novas teclas
    if (myTypingTimeout.current) clearTimeout(myTypingTimeout.current);
    myTypingTimeout.current = setTimeout(() => {
      myTypingStatus.current = false;
      try {
        updateDoc(doc(db, 'chat_sessions', chatId), {
          [`isTyping_${currentRole}`]: false,
        });
      } catch (e) {}
    }, 2500);

  }, [chatId, currentRole, currentName]);

  const notifyStopTyping = useCallback(() => {
    if (!chatId) return;

    try {
      channelRef.current?.postMessage({
        chatId,
        senderRole: currentRole,
        senderName: currentName,
        isTyping: false,
        timestamp: Date.now(),
      });
    } catch (e) {}

    if (myTypingStatus.current) {
      myTypingStatus.current = false;
      if (myTypingTimeout.current) clearTimeout(myTypingTimeout.current);
      try {
        updateDoc(doc(db, 'chat_sessions', chatId), {
          [`isTyping_${currentRole}`]: false,
        });
      } catch (e) {}
    }
  }, [chatId, currentRole, currentName]);

  return {
    isPeerTyping: peerTypingState.isTyping,
    peerTypingName: peerTypingState.name,
    notifyTyping,
    notifyStopTyping,
  };
}
