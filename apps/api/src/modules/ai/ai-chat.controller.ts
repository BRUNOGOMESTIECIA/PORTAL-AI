import { Body, Controller, Get, Post, MessageEvent, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { AiChatService } from './ai-chat.service';

class AiChatDto {
  @IsString()
  @MaxLength(4000)
  message: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('usage')
  @ApiOperation({ summary: 'Retorna métricas de consumo de IA e tokens do tenant' })
  getUsage() {
    return this.aiChatService.getUsageMetrics();
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat com IA (RAG + copiloto)' })
  chat(@Body() dto: AiChatDto, @CurrentUser() user: UserEntity) {
    return this.aiChatService.chat(user.id, dto.message, dto.history ?? []);
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Streaming de respostas da IA em tempo real (palavra por palavra)' })
  chatStream(@Body() dto: AiChatDto, @CurrentUser() user: UserEntity): Observable<MessageEvent> {
    const generator = this.aiChatService.chatStream(user.id, dto.message, dto.history ?? []);
    
    return new Observable((subscriber) => {
      (async () => {
        try {
          for await (const chunk of generator) {
            subscriber.next({ data: JSON.stringify({ chunk }) } as MessageEvent);
          }
          subscriber.complete();
        } catch (err: any) {
          subscriber.error(err);
        }
      })();
    });
  }
}


