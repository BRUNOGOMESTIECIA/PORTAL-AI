import { Injectable } from '@nestjs/common';
import { getTenantContext, getTenantDataSource } from '../../core/database/tenant.context';
import { WsGateway } from '../../core/websocket/ws.gateway';
import { SocketEvent } from '@portal/shared';

@Injectable()
export class ChatInternalService {
  constructor(private readonly wsGateway: WsGateway) {}

  async sendMessage(channelId: string, senderId: string, body: string, threadParentId?: string, mentions: string[] = []) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();

    const [msg] = await ds.query(
      `INSERT INTO internal_messages (channel_id, sender_id, body, thread_parent_id, mentions)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [channelId, senderId, body, threadParentId ?? null, JSON.stringify(mentions)],
    );

    this.wsGateway.emitToChannel(ctx.tenantSlug, channelId, SocketEvent.INTERNAL_MESSAGE_NEW, msg);

    // Update last_read for sender
    await ds.query(
      `UPDATE chat_channel_members SET last_read_at = now() WHERE channel_id = $1 AND user_id = $2`,
      [channelId, senderId],
    );

    return msg;
  }

  async getChannelMessages(channelId: string, page = 1, limit = 50) {
    const ds = getTenantDataSource();
    const offset = (page - 1) * limit;
    return ds.query(
      `SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM internal_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.channel_id = $1 AND m.is_deleted = false AND m.thread_parent_id IS NULL
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [channelId, limit, offset],
    );
  }

  async getThreadReplies(parentMessageId: string) {
    const ds = getTenantDataSource();
    return ds.query(
      `SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM internal_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.thread_parent_id = $1 AND m.is_deleted = false
       ORDER BY m.created_at ASC`,
      [parentMessageId],
    );
  }

  async editMessage(messageId: string, body: string, userId: string) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();
    const [msg] = await ds.query(
      `UPDATE internal_messages SET body = $1, is_edited = true, edited_at = now(), updated_at = now()
       WHERE id = $2 AND sender_id = $3 RETURNING *`,
      [body, messageId, userId],
    );
    if (msg) {
      this.wsGateway.emitToChannel(ctx.tenantSlug, msg.channel_id, SocketEvent.INTERNAL_MESSAGE_UPDATED, msg);
    }
    return msg;
  }

  async deleteMessage(messageId: string, userId: string) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();
    const [msg] = await ds.query(
      `UPDATE internal_messages SET is_deleted = true, deleted_at = now()
       WHERE id = $1 AND sender_id = $2 RETURNING *`,
      [messageId, userId],
    );
    if (msg) {
      this.wsGateway.emitToChannel(ctx.tenantSlug, msg.channel_id, SocketEvent.INTERNAL_MESSAGE_UPDATED, { id: messageId, isDeleted: true });
    }
  }

  async getUserChannels(userId: string) {
    const ds = getTenantDataSource();
    return ds.query(
      `SELECT c.*, cm.role, cm.last_read_at,
              (SELECT COUNT(*) FROM internal_messages m
               WHERE m.channel_id = c.id AND m.created_at > COALESCE(cm.last_read_at, '1970-01-01')
               AND m.sender_id != $1 AND m.is_deleted = false) AS unread_count
       FROM chat_channels c
       JOIN chat_channel_members cm ON cm.channel_id = c.id
       WHERE cm.user_id = $1 AND c.is_archived = false
       ORDER BY c.name`,
      [userId],
    );
  }
}
