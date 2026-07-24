import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
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

  @Post('chat')
  @ApiOperation({ summary: 'Chat com IA (RAG + copiloto)' })
  chat(@Body() dto: AiChatDto, @CurrentUser() user: UserEntity) {
    return this.aiChatService.chat(user.id, dto.message, dto.history ?? []);
  }
}
