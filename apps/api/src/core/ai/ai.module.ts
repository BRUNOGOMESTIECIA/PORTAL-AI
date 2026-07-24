import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { RagService } from './rag.service';
import { MasterDatabaseModule } from '../database/master-database.module';

@Module({
  imports: [MasterDatabaseModule],
  providers: [AiService, RagService],
  exports: [AiService, RagService],
})
export class AiModule {}
