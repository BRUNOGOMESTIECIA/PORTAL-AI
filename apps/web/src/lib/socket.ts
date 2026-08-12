import { io, Socket } from 'socket.io-client';
import { getStoredToken, getStoredTenantSlug } from './api-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

let socketInstance: Socket | null = null;

/**
 * Inicializa ou retorna a instância ativa do Socket.io.
 */
export function getSocket(): Socket {
  if (!socketInstance) {
    const token = getStoredToken();
    const tenantSlug = getStoredTenantSlug();

    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token,
        tenantSlug,
      },
      extraHeaders: {
        'X-Tenant-Slug': tenantSlug,
      },
    });

    socketInstance.on('connect', () => {
      console.info('[Socket.io] Conectado com sucesso ao backend NestJS (ID:', socketInstance?.id, ')');
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[Socket.io] Erro de conexão:', error.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.info('[Socket.io] Desconectado:', reason);
    });
  }

  return socketInstance;
}

/**
 * Entra na sala em tempo real de uma sessão de chat específica.
 */
export function joinChatRoom(sessionId: string) {
  const socket = getSocket();
  socket.emit('joinRoom', { room: `chat_${sessionId}` });
}

/**
 * Entra na sala global de tenant para escutar notificações de tickets.
 */
export function joinTenantRoom(tenantSlug?: string) {
  const socket = getSocket();
  const slug = tenantSlug || getStoredTenantSlug();
  socket.emit('joinRoom', { room: `tenant_${slug}` });
}

/**
 * Encerra a conexão ativa do Socket.io.
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
