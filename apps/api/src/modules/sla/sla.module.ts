import { Module } from '@nestjs/common';
import { SlaService } from './sla.service';
import { MasterDatabaseModule } from '../../core/database/master-database.module';

@Module({
  imports: [MasterDatabaseModule],
  providers: [SlaService],
  exports: [SlaService],
})
export class SlaModule {}
