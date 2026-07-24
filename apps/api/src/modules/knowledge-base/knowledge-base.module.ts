import { Module } from '@nestjs/common';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiModule } from '../../core/ai/ai.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AiModule, AuditModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
