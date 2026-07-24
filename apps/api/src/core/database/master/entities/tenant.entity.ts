import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SsoProvider, TenantStatus } from '@portal/shared';
import { AiTokenUsageEntity } from './ai-token-usage.entity';
import { PlatformAlertEntity } from './platform-alert.entity';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 63, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Column({ name: 'db_name', type: 'varchar', length: 255 })
  dbName: string;

  @Column({ name: 'db_user', type: 'varchar', length: 255 })
  dbUser: string;

  @Column({ name: 'db_password_encrypted', type: 'text' })
  dbPasswordEncrypted: string;

  @Column({ name: 'sso_provider', type: 'enum', enum: SsoProvider, default: SsoProvider.NONE })
  ssoProvider: SsoProvider;

  @Column({ name: 'sso_config', type: 'jsonb', nullable: true })
  ssoConfig: Record<string, string> | null;

  @Column({ name: 'sso_allowed_domains', type: 'text', array: true, default: '{}' })
  ssoAllowedDomains: string[];

  @Column({ name: 'ai_enabled', type: 'boolean', default: true })
  aiEnabled: boolean;

  @Column({ name: 'ai_model', type: 'varchar', length: 100, nullable: true })
  aiModel: string | null;

  @Column({ name: 'ai_token_limit_monthly', type: 'int', nullable: true })
  aiTokenLimitMonthly: number | null;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, unknown>;

  @OneToMany(() => AiTokenUsageEntity, (u) => u.tenant)
  aiTokenUsage: AiTokenUsageEntity[];

  @OneToMany(() => PlatformAlertEntity, (a) => a.tenant)
  platformAlerts: PlatformAlertEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
