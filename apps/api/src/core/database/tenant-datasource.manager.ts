import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { LRUCache } from 'lru-cache';
import * as CryptoJS from 'crypto-js';
import { TenantContext } from '@portal/shared';
import { getTenantEntities } from './tenant/entities';
import { getTenantMigrations } from './tenant/migrations';

const POOL_MAX_SIZE = 100;
const HEALTH_CHECK_INTERVAL_MS = 30_000;

@Injectable()
export class TenantDataSourceManager implements OnModuleDestroy {
  private readonly logger = new Logger(TenantDataSourceManager.name);
  private readonly pool: LRUCache<string, DataSource>;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private readonly encryptionKey: string;

  constructor(private readonly config: ConfigService) {
    this.encryptionKey = config.get<string>('DB_ENCRYPTION_KEY', '');
    this.pool = new LRUCache<string, DataSource>({
      max: POOL_MAX_SIZE,
      dispose: (dataSource) => {
        dataSource.destroy().catch((err) =>
          this.logger.error(`Error destroying DataSource: ${err.message}`),
        );
      },
    });
    this.startHealthChecks();
  }

  async getDataSource(ctx: TenantContext): Promise<DataSource> {
    const cached = this.pool.get(ctx.tenantSlug);
    if (cached?.isInitialized) return cached;

    const password = this.decryptPassword(ctx.dbPasswordEncrypted);
    const ds = new DataSource(this.buildOptions(ctx, password));
    await ds.initialize();
    this.pool.set(ctx.tenantSlug, ds);
    this.logger.log(`DataSource initialized for tenant: ${ctx.tenantSlug}`);
    return ds;
  }

  async provisionTenantDatabase(ctx: TenantContext): Promise<void> {
    const password = this.decryptPassword(ctx.dbPasswordEncrypted);
    // Create DB and user using master connection
    const masterDs = new DataSource({
      type: 'postgres',
      host: this.config.get('MASTER_DB_HOST'),
      port: this.config.get<number>('MASTER_DB_PORT', 5432),
      database: this.config.get('MASTER_DB_NAME'),
      username: this.config.get('MASTER_DB_USER'),
      password: this.config.get('MASTER_DB_PASSWORD'),
    });
    await masterDs.initialize();
    try {
      // Create role if not exists (DO blocks don't support $params; check first)
      const existing = await masterDs.query(
        `SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = $1`,
        [ctx.dbUser],
      );
      if (existing.length === 0) {
        // dbUser is slug-derived (alphanumeric + underscore), password is hex — both safe to interpolate
        await masterDs.query(
          `CREATE ROLE "${ctx.dbUser}" WITH LOGIN PASSWORD '${password}'`,
        );
      }
      // Create database
      await masterDs.query(`CREATE DATABASE "${ctx.dbName}" OWNER "${ctx.dbUser}"`);
    } finally {
      await masterDs.destroy();
    }

    // Create extensions as master user (requires superuser)
    const extDs = new DataSource({
      type: 'postgres',
      host: this.config.get('MASTER_DB_HOST'),
      port: this.config.get<number>('MASTER_DB_PORT', 5432),
      database: ctx.dbName,
      username: this.config.get('MASTER_DB_USER'),
      password: this.config.get('MASTER_DB_PASSWORD'),
    });
    await extDs.initialize();
    try {
      await extDs.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await extDs.query('CREATE EXTENSION IF NOT EXISTS "vector"');
      await extDs.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    } finally {
      await extDs.destroy();
    }

    // Run migrations as tenant user
    const tenantDs = new DataSource(this.buildOptions(ctx, password));
    await tenantDs.initialize();
    try {
      await tenantDs.runMigrations({ transaction: 'each' });
      this.logger.log(`Tenant DB provisioned: ${ctx.dbName}`);
    } finally {
      await tenantDs.destroy();
    }
  }

  encryptPassword(plaintext: string): string {
    return CryptoJS.AES.encrypt(plaintext, this.encryptionKey).toString();
  }

  decryptPassword(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private buildOptions(ctx: TenantContext, password: string): DataSourceOptions {
    return {
      type: 'postgres',
      host: this.config.get('TENANT_DB_HOST', 'localhost'),
      port: this.config.get<number>('TENANT_DB_PORT', 5432),
      database: ctx.dbName,
      username: ctx.dbUser,
      password,
      entities: getTenantEntities(),
      migrations: getTenantMigrations(),
      migrationsRun: false,
      synchronize: false,
      logging: this.config.get('NODE_ENV') !== 'production',
      ssl: this.config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      extra: { max: 5, idleTimeoutMillis: 30_000 },
    };
  }

  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      for (const [slug, ds] of this.pool.entries()) {
        if (!ds.isInitialized) {
          this.pool.delete(slug);
          continue;
        }
        try {
          await ds.query('SELECT 1');
        } catch {
          this.logger.warn(`Health check failed for tenant ${slug}, evicting`);
          this.pool.delete(slug);
        }
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
    for (const [, ds] of this.pool.entries()) {
      if (ds.isInitialized) await ds.destroy();
    }
  }
}
