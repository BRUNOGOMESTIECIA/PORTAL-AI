import { Injectable, Logger, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { TenantStatus } from '@portal/shared';
import { TenantEntity } from './master/entities/tenant.entity';
import { TenantDataSourceManager } from './tenant-datasource.manager';
import { tenantStorage } from './tenant.context';
import { RedisService } from '../redis/redis.service';

const TENANT_CACHE_TTL_SECONDS = 5 * 60; // 5 min

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);
  private readonly isDev: boolean;
  private readonly devTenantSlug: string | undefined;

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    private readonly dsManager: TenantDataSourceManager,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.isDev = config.get('NODE_ENV') !== 'production';
    this.devTenantSlug = config.get<string>('DEV_TENANT_SLUG');
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const host = req.headers.host ?? '';
    const slug = this.resolveSlug(req, host);

    if (!slug) {
      res.status(404).json({ message: 'Tenant não encontrado. Configure DEV_TENANT_SLUG no .env para desenvolvimento local.' });
      return;
    }

    try {
      const tenant = await this.resolveTenant(slug);
      if (tenant.status !== TenantStatus.ACTIVE && tenant.status !== TenantStatus.TRIAL) {
        res.status(403).json({ message: 'Tenant suspenso ou cancelado' });
        return;
      }

      const dataSource = await this.dsManager.getDataSource({
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        dbName: tenant.dbName,
        dbUser: tenant.dbUser,
        dbPasswordEncrypted: tenant.dbPasswordEncrypted,
      });

      tenantStorage.run(
        {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          dbName: tenant.dbName,
          dataSource,
          aiEnabled: tenant.aiEnabled,
          aiModel: tenant.aiModel,
          ssoAllowedDomains: tenant.ssoAllowedDomains,
        },
        () => next(),
      );
    } catch (err: unknown) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(`Falha ao resolver tenant "${slug}": ${(err as Error).message}`);
      res.status(503).json({ message: 'Serviço temporariamente indisponível' });
    }
  }

  private resolveSlug(req: Request, host: string): string | null {
    // 1. Header explícito X-Tenant-Slug (dev / testes)
    const headerSlug = req.headers['x-tenant-slug'] as string | undefined;
    if (headerSlug) return headerSlug.toLowerCase().trim();

    // 2. Subdomínio: "acme.empresa.com.br" → "acme"
    const parts = host.split('.');
    if (parts.length >= 2) {
      const slug = parts[0].toLowerCase().replace(/:\d+$/, '');
      if (slug && slug !== 'www') return slug;
    }

    // 3. Dev fallback: quando acessado via localhost sem subdomínio
    if (this.isDev && this.devTenantSlug) {
      return this.devTenantSlug;
    }

    return null;
  }

  private async resolveTenant(slug: string): Promise<TenantEntity> {
    const cacheKey = `tenant:${slug}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as TenantEntity;

    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (!tenant) throw new NotFoundException(`Tenant "${slug}" não encontrado`);

    await this.redis.set(cacheKey, JSON.stringify(tenant), TENANT_CACHE_TTL_SECONDS);
    return tenant;
  }
}
