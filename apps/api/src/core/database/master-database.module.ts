import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './master/entities/tenant.entity';
import { AiTokenUsageEntity } from './master/entities/ai-token-usage.entity';
import { PlatformAlertEntity } from './master/entities/platform-alert.entity';
import { TenantDataSourceManager } from './tenant-datasource.manager';
import { InitMasterSchema1700000000000 } from './master/migrations/1700000000000-InitMasterSchema';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('MASTER_DB_HOST', 'localhost'),
        port: config.get<number>('MASTER_DB_PORT', 5432),
        database: config.get('MASTER_DB_NAME', 'portal_master'),
        username: config.get('MASTER_DB_USER'),
        password: config.get('MASTER_DB_PASSWORD'),
        entities: [TenantEntity, AiTokenUsageEntity, PlatformAlertEntity],
        migrations: [InitMasterSchema1700000000000],
        migrationsRun: true,
        synchronize: false,
        logging: config.get('NODE_ENV') !== 'production',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TenantEntity, AiTokenUsageEntity, PlatformAlertEntity]),
  ],
  providers: [TenantDataSourceManager],
  exports: [TenantDataSourceManager, TypeOrmModule],
})
export class MasterDatabaseModule {}
