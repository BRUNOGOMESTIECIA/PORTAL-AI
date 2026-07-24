import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from './tenant.entity';

@Entity('ai_token_usage')
@Index(['tenantId', 'year', 'month'], { unique: true })
export class AiTokenUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantEntity, (t) => t.aiTokenUsage, { onDelete: 'CASCADE' })
  tenant: TenantEntity;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ name: 'input_tokens', type: 'bigint', default: 0 })
  inputTokens: number;

  @Column({ name: 'output_tokens', type: 'bigint', default: 0 })
  outputTokens: number;

  @Column({ name: 'total_cost_usd', type: 'decimal', precision: 10, scale: 6, default: 0 })
  totalCostUsd: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
