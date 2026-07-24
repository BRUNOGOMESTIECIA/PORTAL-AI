import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../services/api';
import { useSocket } from '../../hooks/use-socket';
import { SocketEvent } from '@portal/shared';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', 'unread'],
    queryFn: () => apiGet('/notifications/unread'),
    refetchInterval: 60_000,
  });

  // Real-time new notifications
  React.useEffect(() => {
    if (!socket) return;
    const handler = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
    socket.on(SocketEvent.NOTIFICATION_NEW, handler);
    return () => { socket.off(SocketEvent.NOTIFICATION_NEW, handler); };
  }, [socket, queryClient]);

  const markRead = useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-notification-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Notificações</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead.mutate(n.id)}
                    className={cn(
                      'w-full border-b border-border px-4 py-3 text-left hover:bg-accent transition-colors',
                      !n.readAt && 'bg-primary/5',
                    )}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
