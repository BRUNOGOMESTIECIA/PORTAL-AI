import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread')
  @ApiOperation({ summary: 'Notificações não lidas do usuário autenticado' })
  getUnread(@CurrentUser() user: UserEntity) {
    return this.notificationsService.getUnread(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.notificationsService.markRead(id, user.id);
  }

  @Post('webpush/subscribe')
  @ApiOperation({ summary: 'Registrar assinatura de Web Push Notifications' })
  subscribeWebPush(@Body() body: any, @CurrentUser() user: UserEntity) {
    return this.notificationsService.saveWebPushSubscription(user.id, body);
  }
}

