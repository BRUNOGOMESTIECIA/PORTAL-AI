import { Module } from '@nestjs/common';
import { ChatInternalController } from './chat-internal.controller';
import { ChatInternalService } from './chat-internal.service';
import { WebsocketModule } from '../../core/websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [ChatInternalController],
  providers: [ChatInternalService],
  exports: [ChatInternalService],
})
export class ChatInternalModule {}
