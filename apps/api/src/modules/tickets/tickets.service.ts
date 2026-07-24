import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { getTenantContext, getTenantDataSource } from '../../core/database/tenant.context';
import { AuditService } from '../audit/audit.service';
import { SlaService } from '../sla/sla.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WsGateway } from '../../core/websocket/ws.gateway';
import { AuditActorType, NotificationType, SocketEvent, TicketPriority, TicketStatus } from '@portal/shared';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CloseTicketDto } from './dto/close-ticket.dto';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly slaService: SlaService,
    private readonly notificationsService: NotificationsService,
    private readonly wsGateway: WsGateway,
  ) {}

  async create(dto: CreateTicketDto, actor: UserEntity) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();
    const priority = dto.priority ?? TicketPriority.MEDIUM;

    // Resolve SLA policy
    const slaPolicy = await this.slaService.resolvePolicy(
      dto.slaPolicyId ?? null,
      priority,
    );

    const ticket = await ds.query(
      `INSERT INTO tickets (
        title, description, type_id, status, priority,
        requester_id, assignee_id, team_id,
        sla_policy_id, sla_first_response_due_at, sla_resolution_due_at,
        parent_ticket_id, source, created_by_id
      ) VALUES ($1,$2,$3,'new',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        dto.title,
        dto.description ?? null,
        dto.typeId ?? null,
        priority,
        dto.requesterId ?? actor.id,
        dto.assigneeId ?? null,
        dto.teamId ?? null,
        slaPolicy?.id ?? null,
        slaPolicy ? await this.slaService.calcDue(slaPolicy, priority, 'first_response') : null,
        slaPolicy ? await this.slaService.calcDue(slaPolicy, priority, 'resolution') : null,
        dto.parentTicketId ?? null,
        dto.source ?? 'portal',
        actor.id,
      ],
    );

    const created = ticket[0];

    // Schedule SLA breach jobs
    if (slaPolicy) {
      await this.slaService.scheduleBreachJobs(ctx.tenantSlug, created.id, created);
    }

    // Audit
    await this.auditService.log({
      actorId: actor.id,
      actorType: AuditActorType.USER,
      actorEmail: actor.email,
      action: 'ticket.created',
      entityType: 'ticket',
      entityId: created.id,
      entityDisplayName: `#${created.number} ${created.title}`,
      afterState: created,
    });

    // Notify assignee if set
    if (created.assignee_id) {
      await this.notificationsService.send({
        userId: created.assignee_id,
        type: NotificationType.TICKET_ASSIGNED,
        title: `Chamado atribuído: #${created.number}`,
        body: created.title,
        data: { ticketId: created.id },
      });
    }

    // Emit WebSocket
    this.wsGateway.emitToTenant(ctx.tenantSlug, SocketEvent.TICKET_UPDATED, {
      type: 'created',
      ticket: created,
    });

    return created;
  }

  async findAll(filters: {
    status?: TicketStatus;
    priority?: string;
    assigneeId?: string;
    requesterId?: string;
    page?: number;
    limit?: number;
  }) {
    const ds = getTenantDataSource();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 25;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (filters.status) {
      conditions.push(`t.status = $${paramIdx++}`);
      params.push(filters.status);
    }
    if (filters.priority) {
      conditions.push(`t.priority = $${paramIdx++}`);
      params.push(filters.priority);
    }
    if (filters.assigneeId) {
      conditions.push(`t.assignee_id = $${paramIdx++}`);
      params.push(filters.assigneeId);
    }
    if (filters.requesterId) {
      conditions.push(`t.requester_id = $${paramIdx++}`);
      params.push(filters.requesterId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, countResult] = await Promise.all([
      ds.query(
        `SELECT t.*,
          u_req.name AS requester_name, u_req.email AS requester_email,
          u_asgn.name AS assignee_name
         FROM tickets t
         LEFT JOIN users u_req ON u_req.id = t.requester_id
         LEFT JOIN users u_asgn ON u_asgn.id = t.assignee_id
         ${where}
         ORDER BY t.created_at DESC
         LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
        [...params, limit, offset],
      ),
      ds.query(`SELECT COUNT(*) FROM tickets t ${where}`, params),
    ]);

    return {
      data: rows,
      meta: {
        total: parseInt(countResult[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult[0].count) / limit),
      },
    };
  }

  async findOne(ticketId: string) {
    const ds = getTenantDataSource();
    const rows = await ds.query(
      `SELECT t.*,
        u_req.name AS requester_name, u_req.email AS requester_email, u_req.avatar_url AS requester_avatar,
        u_asgn.name AS assignee_name, u_asgn.email AS assignee_email,
        tt.name AS type_name,
        sp.name AS sla_policy_name
       FROM tickets t
       LEFT JOIN users u_req ON u_req.id = t.requester_id
       LEFT JOIN users u_asgn ON u_asgn.id = t.assignee_id
       LEFT JOIN ticket_types tt ON tt.id = t.type_id
       LEFT JOIN sla_policies sp ON sp.id = t.sla_policy_id
       WHERE t.id = $1`,
      [ticketId],
    );
    if (!rows.length) throw new NotFoundException('Chamado não encontrado');
    return rows[0];
  }

  async update(ticketId: string, dto: UpdateTicketDto, actor: UserEntity) {
    const ds = getTenantDataSource();
    const ctx = getTenantContext();
    const before = await this.findOne(ticketId);

    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    const updateable: (keyof UpdateTicketDto)[] = [
      'title', 'description', 'priority', 'status',
      'assigneeId', 'teamId', 'typeId',
    ];

    for (const key of updateable) {
      if (dto[key] !== undefined) {
        const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${col} = $${idx++}`);
        params.push(dto[key]);
      }
    }

    if (!fields.length) return before;

    fields.push(`updated_at = now()`);
    params.push(ticketId);

    const rows = await ds.query(
      `UPDATE tickets SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );
    const updated = rows[0];

    // SLA pause/resume on pending
    if (dto.status === TicketStatus.PENDING && before.status !== TicketStatus.PENDING) {
      await ds.query(`UPDATE tickets SET sla_paused_at = now() WHERE id = $1`, [ticketId]);
    } else if (
      before.status === TicketStatus.PENDING &&
      dto.status &&
      dto.status !== TicketStatus.PENDING
    ) {
      await this.slaService.resumeSla(ticketId);
    }

    // Record history per changed field
    for (const key of updateable) {
      if (dto[key] !== undefined && String(dto[key]) !== String(before[key.replace(/([A-Z])/g, '_$1').toLowerCase()])) {
        await ds.query(
          `INSERT INTO ticket_history (ticket_id, changed_by_id, field_name, old_value, new_value)
           VALUES ($1,$2,$3,$4,$5)`,
          [ticketId, actor.id, key, before[key.replace(/([A-Z])/g, '_$1').toLowerCase()], dto[key]],
        );
      }
    }

    // Audit
    await this.auditService.log({
      actorId: actor.id,
      actorType: AuditActorType.USER,
      actorEmail: actor.email,
      action: 'ticket.updated',
      entityType: 'ticket',
      entityId: ticketId,
      entityDisplayName: `#${updated.number} ${updated.title}`,
      beforeState: before,
      afterState: updated,
    });

    this.wsGateway.emitToTicket(ctx.tenantSlug, ticketId, SocketEvent.TICKET_UPDATED, {
      type: 'updated',
      ticket: updated,
    });

    return updated;
  }

  async close(ticketId: string, dto: CloseTicketDto, actor: UserEntity) {
    const ctx = getTenantContext();
    const ds = getTenantDataSource();

    const rows = await ds.query(
      `UPDATE tickets SET
        status = 'closed',
        resolution_category_id = $1,
        closed_at = now(),
        updated_at = now(),
        sla_resolution_met = (now() <= sla_resolution_due_at OR sla_resolution_due_at IS NULL)
       WHERE id = $2
       RETURNING *`,
      [dto.resolutionCategoryId ?? null, ticketId],
    );

    const ticket = rows[0];

    await this.auditService.log({
      actorId: actor.id,
      actorType: AuditActorType.USER,
      actorEmail: actor.email,
      action: 'ticket.closed',
      entityType: 'ticket',
      entityId: ticketId,
      entityDisplayName: `#${ticket.number} ${ticket.title}`,
      afterState: { status: 'closed', resolutionCategoryId: dto.resolutionCategoryId },
    });

    this.wsGateway.emitToTenant(ctx.tenantSlug, SocketEvent.TICKET_UPDATED, {
      type: 'closed',
      ticket,
    });

    return ticket;
  }
}
