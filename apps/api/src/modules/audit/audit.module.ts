import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { MasterDatabaseModule } from '../../core/database/master-database.module';

@Module({
  imports: [MasterDatabaseModule],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}

