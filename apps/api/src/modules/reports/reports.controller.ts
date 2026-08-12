import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export/csv')
  @RequirePermissions('reports.view')
  async exportCsv(@Res() res: Response) {
    const csvContent = await this.reportsService.generateCsvExport();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio_tickets.csv"');
    res.send(csvContent);
  }


  @Get('tickets')
  @RequirePermissions('reports.view')
  getTicketSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getTicketSummary(from, to);
  }

  @Get('sla')
  @RequirePermissions('reports.view')
  getSlaSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getSlaSummary(from, to);
  }

  @Get('dashboard')
  @RequirePermissions('reports.view')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('ai-usage')
  @RequirePermissions('admin.settings')
  getAiUsage() {
    return this.reportsService.getAiUsage();
  }
}

