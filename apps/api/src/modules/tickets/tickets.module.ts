import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { SlaModule } from '../sla/sla.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { StorageModule } from '../../core/storage/storage.module';
import { WebsocketModule } from '../../core/websocket/websocket.module';

@Module({
  imports: [SlaModule, NotificationsModule, AuditModule, StorageModule, WebsocketModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
