import { Injectable, Logger } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';
import { AuditActorType } from '@portal/shared';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../../core/database/master/entities/tenant.entity';
import { TenantDataSourceManager } from '../../core/database/tenant-datasource.manager';

export interface CreateAuditLogDto {
  actorId?: string | null;
  actorType: AuditActorType;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityDisplayName?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
    private readonly dsManager: TenantDataSourceManager,
  ) {}

  private sanitizeState(state: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
    if (!state) return null;
    const sanitized = { ...state };
    const sensitiveKeys = ['password', 'passwordHash', 'password_hash', 'token', 'secret'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '*** MASCARADO (LGPD) ***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeState(sanitized[key] as Record<string, unknown>);
      }
    }
    return sanitized;
  }

  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      const ds = getTenantDataSource();
      await ds.query(
        `INSERT INTO audit_logs (
          actor_id, actor_type, actor_email, action,
          entity_type, entity_id, entity_display_name,
          before_state, after_state, ip_address, user_agent, metadata
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          dto.actorId ?? null,
          dto.actorType,
          dto.actorEmail ?? null,
          dto.action,
          dto.entityType,
          dto.entityId ?? null,
          dto.entityDisplayName ?? null,
          dto.beforeState ? JSON.stringify(this.sanitizeState(dto.beforeState)) : null,
          dto.afterState ? JSON.stringify(this.sanitizeState(dto.afterState)) : null,
          dto.ipAddress ?? null,
          dto.userAgent ?? null,
          dto.metadata ? JSON.stringify(dto.metadata) : null,
        ],
      );
    } catch (err: unknown) {
      // Audit must never crash the main flow
      this.logger.error(`Audit log failed: ${(err as Error).message}`);
    }
  }

  async findAll(filters: {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const ds = getTenantDataSource();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 500);
    const offset = (page - 1) * limit;

    const conds: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filters.entityType) { conds.push(`entity_type = $${idx++}`); params.push(filters.entityType); }
    if (filters.entityId) { conds.push(`entity_id = $${idx++}`); params.push(filters.entityId); }
    if (filters.actorId) { conds.push(`actor_id = $${idx++}`); params.push(filters.actorId); }
    if (filters.action) { conds.push(`action ILIKE $${idx++}`); params.push(`%${filters.action}%`); }
    if (filters.fromDate) { conds.push(`created_at >= $${idx++}`); params.push(filters.fromDate); }
    if (filters.toDate) { conds.push(`created_at <= $${idx++}`); params.push(filters.toDate); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    const [rows, countResult] = await Promise.all([
      ds.query(
        `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset],
      ),
      ds.query(`SELECT COUNT(*) FROM audit_logs ${where}`, params),
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldLogs() {
    this.logger.log('Iniciando limpeza de logs de auditoria antigos (Retenção 5 anos LGPD)...');
    try {
      const tenants = await this.tenantRepo.find({ 
        select: ['id', 'slug', 'dbName', 'dbUser', 'dbPasswordEncrypted'] 
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
          const result = await ds.query(`DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '5 years'`);
          const rowsDeleted = result && result[1] !== undefined ? result[1] : 0;
          this.logger.log(`[${tenant.slug}] Logs antigos removidos com sucesso. Quantidade: ${rowsDeleted}`);
        } catch (err) {
          this.logger.error(`Falha ao limpar logs para tenant ${tenant.slug}: ${(err as Error).message}`);
        }
      }
    } catch (err) {
      this.logger.error(`Falha na execução do Cron de limpeza de logs: ${(err as Error).message}`);
    }
  }
}
