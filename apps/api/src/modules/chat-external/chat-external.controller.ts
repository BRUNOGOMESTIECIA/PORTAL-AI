import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { ChatExternalService } from './chat-external.service';

class CreateSessionDto {
  @IsUUID() queueId: string;
}

class SendMessageDto {
  @IsString() body: string;
}

class FinishSessionDto {
  @IsOptional() @IsUUID() resolutionCategoryId?: string;
}

@ApiTags('Chat External')
@Controller('chat')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ChatExternalController {
  constructor(private readonly chatService: ChatExternalService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Iniciar sessão de chat' })
  createSession(@Body() dto: CreateSessionDto, @CurrentUser() user: UserEntity) {
    return this.chatService.createSession(dto.queueId, user.id);
  }

  @Get('queues/:queueId')
  @RequirePermissions('chat.view')
  @ApiOperation({ summary: 'Fila de espera de uma fila de atendimento' })
  getQueue(@Param('queueId', ParseUUIDPipe) queueId: string) {
    return this.chatService.getQueue(queueId);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Mensagens de uma sessão de chat' })
  getMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getSessionMessages(id);
  }

  @Get('sessions/:id/ai-suggestions')
  @RequirePermissions('chat.attend')
  @ApiOperation({ summary: 'Sugestões do copiloto IA para o agente' })
  getAiSuggestions(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getAiSuggestions(id);
  }

  @Post('sessions/:id/messages')
  @ApiOperation({ summary: 'Enviar mensagem em uma sessão de chat' })
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.chatService.sendMessage(id, user.id, dto.body);
  }

  @Patch('sessions/:id/assign')
  @RequirePermissions('chat.attend')
  @ApiOperation({ summary: 'Agente assume sessão de chat' })
  assignAgent(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserEntity) {
    return this.chatService.assignAgent(id, user.id);
  }

  @Patch('sessions/:id/finish')
  @RequirePermissions('chat.attend')
  @ApiOperation({ summary: 'Encerrar sessão de chat' })
  finishSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FinishSessionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.chatService.finishSession(id, user.id, dto.resolutionCategoryId);
  }
}
