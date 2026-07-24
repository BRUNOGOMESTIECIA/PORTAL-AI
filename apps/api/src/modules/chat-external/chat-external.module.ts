import { Module } from '@nestjs/common';
import { ChatExternalController } from './chat-external.controller';
import { ChatExternalService } from './chat-external.service';
import { WebsocketModule } from '../../core/websocket/websocket.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { AiModule } from '../../core/ai/ai.module';

@Module({
  imports: [WebsocketModule, NotificationsModule, AuditModule, AiModule],
  controllers: [ChatExternalController],
  providers: [ChatExternalService],
  exports: [ChatExternalService],
})
export class ChatExternalModule {}
