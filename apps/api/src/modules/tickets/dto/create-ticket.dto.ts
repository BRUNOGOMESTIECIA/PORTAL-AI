import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, TicketSource } from '@portal/shared';

export class CreateTicketDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority = TicketPriority.MEDIUM;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  requesterId?: string; // Technician creating on behalf of user (without impersonation)

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  slaPolicyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentTicketId?: string;

  @ApiPropertyOptional({ enum: TicketSource })
  @IsOptional()
  @IsEnum(TicketSource)
  source?: TicketSource;
}
