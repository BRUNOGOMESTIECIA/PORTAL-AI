import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { ChatInternalService } from './chat-internal.service';

class SendInternalMessageDto {
  @IsString() body: string;
  @IsOptional() @IsUUID() threadParentId?: string;
  @IsOptional() mentions?: string[];
}

@ApiTags('Chat Internal')
@Controller('internal')
@UseGuards(JwtAuthGuard)
export class ChatInternalController {
  constructor(private readonly chatInternalService: ChatInternalService) {}

  @Get('channels')
  getChannels(@CurrentUser() user: UserEntity) {
    return this.chatInternalService.getUserChannels(user.id);
  }

  @Get('channels/:id/messages')
  getMessages(@Param('id', ParseUUIDPipe) id: string, @Query('page') page?: number) {
    return this.chatInternalService.getChannelMessages(id, page);
  }

  @Post('channels/:id/messages')
  sendMessage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SendInternalMessageDto, @CurrentUser() user: UserEntity) {
    return this.chatInternalService.sendMessage(id, user.id, dto.body, dto.threadParentId, dto.mentions ?? []);
  }

  @Get('messages/:id/thread')
  getThread(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatInternalService.getThreadReplies(id);
  }

  @Patch('messages/:id')
  editMessage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { body: string }, @CurrentUser() user: UserEntity) {
    return this.chatInternalService.editMessage(id, dto.body, user.id);
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.chatInternalService.deleteMessage(id, user.id);
  }
}
