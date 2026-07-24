import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { MasterDatabaseModule } from './core/database/master-database.module';
import { TenantMiddleware } from './core/database/tenant.middleware';
import { AuthModule } from './core/auth/auth.module';
import { RedisModule } from './core/redis/redis.module';
import { HealthController } from './health/health.controller';
import { AdminMasterModule } from './modules/admin-master/admin-master.module';
import { EmailModule } from './core/email/email.module';
import { StorageModule } from './core/storage/storage.module';
import { WebsocketModule } from './core/websocket/websocket.module';
import { AiModule } from './core/ai/ai.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ChatExternalModule } from './modules/chat-external/chat-external.module';
import { ChatInternalModule } from './modules/chat-internal/chat-internal.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { SlaModule } from './modules/sla/sla.module';
import { AutomationModule } from './modules/automation/automation.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { AiChatModule } from './modules/ai/ai-chat.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 100 },
      { name: 'long', ttl: 3_600_000, limit: 3000 },
    ]),
    ScheduleModule.forRoot(),
    MasterDatabaseModule,
    RedisModule,
    AuthModule,
    EmailModule,
    StorageModule,
    WebsocketModule,
    AiModule,
    UsersModule,
    RolesModule,
    TicketsModule,
    ChatExternalModule,
    ChatInternalModule,
    KnowledgeBaseModule,
    ServiceCatalogModule,
    SlaModule,
    AutomationModule,
    WebhooksModule,
    NotificationsModule,
    ReportsModule,
    AuditModule,
    AiChatModule,
    AdminMasterModule,
    IntegrationsModule,
    AssetsModule,
  ],
  controllers: [HealthController],
  providers: [TenantMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'admin/master/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
