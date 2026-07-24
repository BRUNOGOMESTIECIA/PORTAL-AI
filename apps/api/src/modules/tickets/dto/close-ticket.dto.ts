import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CloseTicketDto {
  @ApiPropertyOptional({ description: 'Categoria de resolução (editável pelo técnico)' })
  @IsOptional()
  @IsUUID()
  resolutionCategoryId?: string;
}
