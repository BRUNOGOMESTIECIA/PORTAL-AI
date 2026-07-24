import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcrypt';
import { TenantEntity } from '../../core/database/master/entities/tenant.entity';
import { TenantDataSourceManager } from '../../core/database/tenant-datasource.manager';
import { TenantStatus } from '@portal/shared';

@Injectable()
export class AdminMasterService {
  private readonly logger = new Logger(AdminMasterService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    private readonly dsManager: TenantDataSourceManager,
    private readonly config: ConfigService,
  ) {}

  listTenants() {
    return this.tenantRepo.find({
      select: ['id', 'slug', 'name', 'status', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async createTenant(name: string, slug: string): Promise<TenantEntity> {
    const existing = await this.tenantRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictException(`Tenant "${slug}" já existe`);

    const dbName = `tenant_${slug.replace(/-/g, '_')}`;
    const dbUser = `tenant_${slug.replace(/-/g, '_')}_user`;
    const dbPassword = crypto.randomBytes(24).toString('hex');

    const encryptionKey = this.config.get<string>('DB_ENCRYPTION_KEY', '');
    const dbPasswordEncrypted = CryptoJS.AES.encrypt(dbPassword, encryptionKey).toString();

    const tenant = this.tenantRepo.create({
      name,
      slug,
      dbName,
      dbUser,
      dbPasswordEncrypted,
      status: TenantStatus.TRIAL,
    });

    const saved = await this.tenantRepo.save(tenant);

    await this.dsManager.provisionTenantDatabase({
      tenantId: saved.id,
      tenantSlug: saved.slug,
      dbName,
      dbUser,
      dbPasswordEncrypted,
    });

    this.logger.log(`Tenant "${slug}" provisionado — banco: ${dbName}`);
    return saved;
  }

  async createTenantAdminUser(
    slug: string,
    email: string,
    name: string,
    password: string,
  ): Promise<{ id: string; email: string; name: string }> {
    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (!tenant) throw new NotFoundException(`Tenant "${slug}" não encontrado`);

    const ds = await this.dsManager.getDataSource({
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      dbName: tenant.dbName,
      dbUser: tenant.dbUser,
      dbPasswordEncrypted: tenant.dbPasswordEncrypted,
    });

    const [role] = await ds.query(
      `SELECT id FROM roles WHERE name = 'Administrator' LIMIT 1`,
    );
    if (!role) throw new Error('Role Administrator não encontrada — execute as migrations');

    const existing = await ds.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    if (existing.length > 0) throw new ConflictException(`Usuário "${email}" já existe neste tenant`);

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await ds.query(
      `INSERT INTO users (email, name, password_hash, role_id, is_active, sso_provider)
       VALUES ($1, $2, $3, $4, true, 'local')
       RETURNING id, email, name`,
      [email, name, passwordHash, role.id],
    );

    this.logger.log(`Admin user "${email}" criado no tenant "${slug}"`);
    return user;
  }
}
