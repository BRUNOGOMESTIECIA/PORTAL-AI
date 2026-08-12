import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getTenantDataSource } from '../../core/database/tenant.context';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../../core/database/master/entities/tenant.entity';
import { TenantDataSourceManager } from '../../core/database/tenant-datasource.manager';
import { TenantStatus, TicketPriority } from '@portal/shared';
import { addMinutes } from 'date-fns';

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    private readonly dsManager: TenantDataSourceManager,
  ) {}

  async resolvePolicy(policyId: string | null, priority: TicketPriority) {
    const ds = getTenantDataSource();
    if (policyId) {
      const rows = await ds.query(`SELECT * FROM sla_policies WHERE id = $1`, [policyId]);
      return rows[0] ?? null;
    }
    const rows = await ds.query(`SELECT * FROM sla_policies WHERE is_default = true LIMIT 1`);
    return rows[0] ?? null;
  }

  async calcDue(
    policy: { id: string },
    priority: TicketPriority,
    type: 'first_response' | 'resolution',
  ): Promise<Date> {
    const ds = getTenantDataSource();
    const col = type === 'first_response' ? 'first_response_minutes' : 'resolution_minutes';
    const rows = await ds.query(
      `SELECT ${col} FROM sla_targets WHERE policy_id = $1 AND priority = $2`,
      [policy.id, priority],
    );
    const minutes = rows[0]?.[col] ?? 480;
    return addMinutes(new Date(), minutes);
  }

  async scheduleBreachJobs(_tenantSlug: string, _ticketId: string, _ticket: Record<string, unknown>): Promise<void> {
    // BullMQ breach job scheduling — implemented in Phase 2
    // For now, the @Cron job below handles breach detection
  }

  async resumeSla(ticketId: string): Promise<void> {
    const ds = getTenantDataSource();
    // Calculate how long SLA was paused and extend due dates accordingly
    await ds.query(
      `UPDATE tickets
       SET sla_paused_duration_minutes = sla_paused_duration_minutes +
           EXTRACT(EPOCH FROM (now() - sla_paused_at)) / 60,
           sla_first_response_due_at = sla_first_response_due_at +
           (now() - sla_paused_at),
           sla_resolution_due_at = sla_resolution_due_at +
           (now() - sla_paused_at),
           sla_paused_at = NULL,
           updated_at = now()
       WHERE id = $1 AND sla_paused_at IS NOT NULL`,
      [ticketId],
    );
  }

  // ─── Periodic SLA breach check ───────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches(): Promise<void> {
    const tenants = await this.tenantRepo.find({
      where: [{ status: TenantStatus.ACTIVE }, { status: TenantStatus.TRIAL }],
    });

    for (const tenant of tenants) {
      try {
        const ds = await this.dsManager.getDataSource({
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          dbName: tenant.dbName,
          dbUser: tenant.dbUser,
          dbPasswordEncrypted: tenant.dbPasswordEncrypted,
        });

        // Find tickets approaching or breaching response SLA
        const breaching = await ds.query(`
          SELECT id, number, title, assignee_id, requester_id,
            sla_first_response_due_at, sla_resolution_due_at
          FROM tickets
          WHERE status NOT IN ('resolved','closed','cancelled')
            AND sla_paused_at IS NULL
            AND (
              (sla_first_response_met IS NULL AND sla_first_response_due_at < now())
              OR
              (sla_resolution_met IS NULL AND sla_resolution_due_at < now())
            )
        `);

        if (breaching.length > 0) {
          this.logger.warn(
            `SLA breach detected: ${breaching.length} tickets in tenant ${tenant.slug}`,
          );
          // Emit SLA breach notifications — NotificationsService injection would create circular dep
          // Use direct DB insert instead
          for (const ticket of breaching) {
            // Eleva a prioridade para critical mantendo o N1 responsável
            await ds.query(
              `UPDATE tickets SET priority = 'critical', updated_at = now() WHERE id = $1`,
              [ticket.id],
            );

            if (ticket.assignee_id) {
              await ds.query(
                `INSERT INTO notifications (user_id, type, title, body, data)
                 VALUES ($1,'sla_breach',$2,$3,$4)
                 ON CONFLICT DO NOTHING`,
                [
                  ticket.assignee_id,
                  `🚨 SLA Estourado / Em Risco: #${ticket.number}`,
                  `Atenção N1: O chamado "${ticket.title}" precisa de sua resposta imediata!`,
                  JSON.stringify({ ticketId: ticket.id, priority: 'critical' }),
                ],
              );
            }
          }

        }
      } catch (err: unknown) {
        this.logger.error(`SLA check failed for ${tenant.slug}: ${(err as Error).message}`);
      }
    }
  }
}
