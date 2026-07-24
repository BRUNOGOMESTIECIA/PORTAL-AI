import { Injectable, Logger } from '@nestjs/common';
import { getTenantContext, getTenantDataSource } from '../../core/database/tenant.context';
import { WsGateway } from '../../core/websocket/ws.gateway';
import { NotificationType, SocketEvent } from '@portal/shared';

export interface SendNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly wsGateway: WsGateway) {}

  async send(dto: SendNotificationDto): Promise<void> {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();

    const [notification] = await ds.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [dto.userId, dto.type, dto.title, dto.body, JSON.stringify(dto.data ?? {})],
    );

    // Emit via WebSocket (real-time)
    this.wsGateway.emitToUser(ctx.tenantSlug, dto.userId, SocketEvent.NOTIFICATION_NEW, notification);
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    const ds = getTenantDataSource();
    await ds.query(
      `UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
      [notificationId, userId],
    );
  }

  async getUnread(userId: string) {
    const ds = getTenantDataSource();
    return ds.query(
      `SELECT * FROM notifications WHERE user_id = $1 AND read_at IS NULL ORDER BY created_at DESC LIMIT 50`,
      [userId],
    );
  }
}
