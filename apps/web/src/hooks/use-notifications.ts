import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notificações de área de trabalho não são suportadas neste navegador.');
      return 'denied';
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        toast.success('Notificações de área de trabalho ativadas com sucesso!');
      } else if (res === 'denied') {
        toast.error('Permissão de notificação negada no navegador.');
      }
      return res;
    } catch (e) {
      console.warn('Erro ao solicitar permissão de notificação:', e);
      return 'denied';
    }
  }, []);

  const sendNotification = useCallback(({ title, body, icon, tag, onClick }: NotificationOptions) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag,
        silent: true // Audio is handled separately by sound-effects.ts
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick();
          notification.close();
        };
      }
    } catch (e) {
      console.warn('Erro ao disparar notificação desktop:', e);
    }
  }, []);

  return {
    permission,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    requestPermission,
    sendNotification
  };
}
