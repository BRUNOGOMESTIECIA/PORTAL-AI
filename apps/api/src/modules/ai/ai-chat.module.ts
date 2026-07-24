import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiModule } from '../../core/ai/ai.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AiModule, AuditModule],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
