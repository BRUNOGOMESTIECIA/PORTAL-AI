import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlatformAlertType } from '@portal/shared';
import { TenantEntity } from './tenant.entity';

@Entity('platform_alerts')
export class PlatformAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PlatformAlertType })
  type: PlatformAlertType;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @ManyToOne(() => TenantEntity, (t) => t.platformAlerts, { nullable: true, onDelete: 'SET NULL' })
  tenant: TenantEntity | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
