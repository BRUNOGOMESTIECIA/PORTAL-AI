import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { HeartbeatService } from './heartbeat.service';
import { MasterDatabaseModule } from '../database/master-database.module';

@Module({
  imports: [MasterDatabaseModule],
  providers: [WsGateway, HeartbeatService],
  exports: [WsGateway],
})
export class WebsocketModule {}
