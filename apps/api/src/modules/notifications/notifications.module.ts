import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { WebsocketModule } from '../../core/websocket/websocket.module';
import { EmailModule } from '../../core/email/email.module';

@Module({
  imports: [WebsocketModule, EmailModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
