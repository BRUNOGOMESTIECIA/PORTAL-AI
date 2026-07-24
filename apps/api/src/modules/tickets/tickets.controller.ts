import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CloseTicketDto } from './dto/close-ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @RequirePermissions('tickets.create')
  @ApiOperation({ summary: 'Abrir novo chamado' })
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: UserEntity) {
    return this.ticketsService.create(dto, user);
  }

  @Get()
  @RequirePermissions('tickets.view')
  @ApiOperation({ summary: 'Listar chamados com filtros e paginação' })
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('requesterId') requesterId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ticketsService.findAll({ status: status as any, priority, assigneeId, requesterId, page, limit });
  }

  @Get(':id')
  @RequirePermissions('tickets.view')
  @ApiOperation({ summary: 'Detalhes de um chamado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('tickets.update')
  @ApiOperation({ summary: 'Atualizar chamado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.ticketsService.update(id, dto, user);
  }

  @Patch(':id/close')
  @RequirePermissions('tickets.close')
  @ApiOperation({ summary: 'Encerrar chamado (modal de fechamento)' })
  close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseTicketDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.ticketsService.close(id, dto, user);
  }
}
