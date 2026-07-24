import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisService } from '../redis/redis.service';
import { SocketEvent, SOCKET_ROOMS } from '@portal/shared';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  transports: ['websocket', 'polling'],
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WsGateway.name);

  constructor(private readonly redisService: RedisService) {}

  afterInit() {
    const pubClient = this.redisService.getClient();
    const subClient = pubClient.duplicate();
    this.server.adapter(createAdapter(pubClient, subClient));
    this.logger.log('Socket.IO initialized with Redis adapter');
  }

  async handleConnection(client: Socket) {
    const tenantSlug = client.handshake.query.tenant as string;
    const userId = client.handshake.query.userId as string;

    if (!tenantSlug) {
      client.disconnect();
      return;
    }

    // Join tenant room + user-specific room
    await client.join(SOCKET_ROOMS.TENANT(tenantSlug));
    if (userId) {
      await client.join(SOCKET_ROOMS.USER(tenantSlug, userId));
    }

    this.logger.debug(`Client connected: ${client.id} (tenant: ${tenantSlug})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // ─── Chat heartbeat ─────────────────────────────────────────────────────────

  @SubscribeMessage(SocketEvent.CHAT_HEARTBEAT)
  async handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; tenantSlug: string },
  ) {
    // Emit ack back to client
    client.emit(SocketEvent.CHAT_HEARTBEAT_ACK, { sessionId: data.sessionId, ts: Date.now() });
    // Actual DB update is handled by HeartbeatService via queue
    return { received: true };
  }

  // ─── Emit helpers (used by other services) ──────────────────────────────────

  emitToTenant(tenantSlug: string, event: string, data: unknown): void {
    this.server.to(SOCKET_ROOMS.TENANT(tenantSlug)).emit(event, data);
  }

  emitToUser(tenantSlug: string, userId: string, event: string, data: unknown): void {
    this.server.to(SOCKET_ROOMS.USER(tenantSlug, userId)).emit(event, data);
  }

  emitToChatSession(tenantSlug: string, sessionId: string, event: string, data: unknown): void {
    this.server.to(SOCKET_ROOMS.CHAT_SESSION(tenantSlug, sessionId)).emit(event, data);
  }

  emitToChannel(tenantSlug: string, channelId: string, event: string, data: unknown): void {
    this.server.to(SOCKET_ROOMS.INTERNAL_CHANNEL(tenantSlug, channelId)).emit(event, data);
  }

  emitToTicket(tenantSlug: string, ticketId: string, event: string, data: unknown): void {
    this.server.to(SOCKET_ROOMS.TICKET(tenantSlug, ticketId)).emit(event, data);
  }
}
