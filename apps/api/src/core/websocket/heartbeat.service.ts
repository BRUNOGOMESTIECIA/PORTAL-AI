import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenantDataSourceManager } from '../database/tenant-datasource.manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../database/master/entities/tenant.entity';
import { ChatSessionStatus, TenantStatus } from '@portal/shared';
import { WsGateway } from './ws.gateway';
import { SocketEvent } from '@portal/shared';

@Injectable()
export class HeartbeatService {
  private readonly logger = new Logger(HeartbeatService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    private readonly dsManager: TenantDataSourceManager,
    private readonly wsGateway: WsGateway,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAbandonedSessions(): Promise<void> {
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

        // Find sessions where heartbeat has expired
        const abandoned = await ds.query(
          `
          UPDATE chat_sessions
          SET status = $1, finished_at = now(), updated_at = now()
          WHERE status = $2
            AND last_heartbeat_at IS NOT NULL
            AND now() - last_heartbeat_at > (heartbeat_tolerance_seconds || ' seconds')::interval
          RETURNING id, agent_id
        `,
          [ChatSessionStatus.ABANDONED, ChatSessionStatus.ACTIVE],
        );

        for (const session of abandoned) {
          this.logger.log(`Session ${session.id} abandoned (tenant: ${tenant.slug})`);
          this.wsGateway.emitToChatSession(tenant.slug, session.id, SocketEvent.CHAT_SESSION_STATUS, {
            sessionId: session.id,
            status: ChatSessionStatus.ABANDONED,
          });
        }
      } catch (err: unknown) {
        this.logger.error(`Heartbeat check failed for tenant ${tenant.slug}: ${(err as Error).message}`);
      }
    }
  }

  async updateHeartbeat(tenantSlug: string, sessionId: string): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { slug: tenantSlug } });
    if (!tenant) return;

    const ds = await this.dsManager.getDataSource({
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      dbName: tenant.dbName,
      dbUser: tenant.dbUser,
      dbPasswordEncrypted: tenant.dbPasswordEncrypted,
    });

    await ds.query(
      `UPDATE chat_sessions SET last_heartbeat_at = now() WHERE id = $1 AND status = $2`,
      [sessionId, ChatSessionStatus.ACTIVE],
    );
  }
}
