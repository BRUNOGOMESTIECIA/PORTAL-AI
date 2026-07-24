import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { getTenantContext, getTenantDataSource } from '../../core/database/tenant.context';
import { WsGateway } from '../../core/websocket/ws.gateway';
import { AuditService } from '../audit/audit.service';
import { AiService } from '../../core/ai/ai.service';
import { AuditActorType, ChatSessionStatus, ChatSenderType, SocketEvent } from '@portal/shared';

@Injectable()
export class ChatExternalService {
  private readonly logger = new Logger(ChatExternalService.name);

  constructor(
    private readonly wsGateway: WsGateway,
    private readonly auditService: AuditService,
    private readonly aiService: AiService,
  ) {}

  async createSession(queueId: string, requesterId: string) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();

    const rows = await ds.query(
      `INSERT INTO chat_sessions (queue_id, requester_id, status, queue_wait_start_at)
       VALUES ($1,$2,'waiting',now()) RETURNING *`,
      [queueId, requesterId],
    );
    const session = rows[0];

    // Insert system welcome message
    const queue = await ds.query(`SELECT welcome_message FROM chat_queues WHERE id = $1`, [queueId]);
    if (queue[0]?.welcome_message) {
      await ds.query(
        `INSERT INTO chat_messages (session_id, sender_type, body)
         VALUES ($1,'system',$2)`,
        [session.id, queue[0].welcome_message],
      );
    }

    await this.auditService.log({
      actorId: requesterId,
      actorType: AuditActorType.USER,
      action: 'chat.session.created',
      entityType: 'chat_session',
      entityId: session.id,
    });

    // Notify agents in the queue room
    this.wsGateway.emitToChatSession(ctx.tenantSlug, session.id, SocketEvent.CHAT_SESSION_STATUS, {
      sessionId: session.id,
      status: ChatSessionStatus.WAITING,
    });

    return session;
  }

  async sendMessage(sessionId: string, senderId: string, body: string, senderType = ChatSenderType.USER) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();

    const [msg] = await ds.query(
      `INSERT INTO chat_messages (session_id, sender_id, sender_type, body)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [sessionId, senderId, senderType, body],
    );

    // Emit to session room
    this.wsGateway.emitToChatSession(ctx.tenantSlug, sessionId, SocketEvent.CHAT_MESSAGE_NEW, msg);

    // Update heartbeat
    await ds.query(
      `UPDATE chat_sessions SET last_heartbeat_at = now(), updated_at = now() WHERE id = $1`,
      [sessionId],
    );

    return msg;
  }

  async assignAgent(sessionId: string, agentId: string) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();

    await ds.query(
      `UPDATE chat_sessions
       SET agent_id = $1, status = 'active', agent_joined_at = now(), last_heartbeat_at = now(), updated_at = now()
       WHERE id = $2`,
      [agentId, sessionId],
    );

    this.wsGateway.emitToChatSession(ctx.tenantSlug, sessionId, SocketEvent.CHAT_AGENT_JOINED, {
      sessionId,
      agentId,
    });
  }

  async finishSession(sessionId: string, agentId: string, resolutionCategoryId?: string) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();

    await ds.query(
      `UPDATE chat_sessions
       SET status = 'finished', finished_at = now(), resolution_category_id = $1, updated_at = now()
       WHERE id = $2`,
      [resolutionCategoryId ?? null, sessionId],
    );

    this.wsGateway.emitToChatSession(ctx.tenantSlug, sessionId, SocketEvent.CHAT_SESSION_STATUS, {
      sessionId,
      status: ChatSessionStatus.FINISHED,
    });
  }

  async getQueue(queueId: string) {
    const ds = getTenantDataSource();
    return ds.query(
      `SELECT s.*, u.name AS requester_name, u.email AS requester_email
       FROM chat_sessions s
       LEFT JOIN users u ON u.id = s.requester_id
       WHERE s.queue_id = $1 AND s.status = 'waiting'
       ORDER BY s.queue_wait_start_at ASC`,
      [queueId],
    );
  }

  async getSessionMessages(sessionId: string) {
    const ds = getTenantDataSource();
    // Filter out AI suggestion messages (copilot, not for client)
    return ds.query(
      `SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM chat_messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.session_id = $1 AND m.is_deleted = false AND m.is_ai_suggestion = false
       ORDER BY m.created_at ASC`,
      [sessionId],
    );
  }

  async getAiSuggestions(sessionId: string) {
    const ds = getTenantDataSource();
    return ds.query(
      `SELECT * FROM chat_messages
       WHERE session_id = $1 AND is_ai_suggestion = true AND is_deleted = false
       ORDER BY created_at DESC LIMIT 5`,
      [sessionId],
    );
  }
}
