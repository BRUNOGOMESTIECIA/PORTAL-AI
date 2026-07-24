import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminMasterController } from './admin-master.controller';
import { AdminMasterService } from './admin-master.service';
import { MasterDatabaseModule } from '../../core/database/master-database.module';

@Module({
  imports: [
    MasterDatabaseModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminMasterController],
  providers: [AdminMasterService],
})
export class AdminMasterModule {}
