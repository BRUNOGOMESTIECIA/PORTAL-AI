import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { AutomationService } from './automation.service';

@ApiTags('Automation')
@Controller('automation')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get()
  @RequirePermissions('automation.view')
  findAll() { return this.automationService.findAll(); }

  @Post()
  @RequirePermissions('automation.manage')
  create(@Body() body: any, @CurrentUser() user: UserEntity) {
    return this.automationService.create(body, user.id);
  }
}
