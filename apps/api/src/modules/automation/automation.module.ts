import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [WebhooksModule, NotificationsModule],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
