import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { ServiceCatalogService } from './service-catalog.service';

@ApiTags('Service Catalog')
@Controller('catalog')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ServiceCatalogController {
  constructor(private readonly catalogService: ServiceCatalogService) {}

  @Get('categories')
  @RequirePermissions('catalog.view')
  getCategories() { return this.catalogService.findCategories(); }

  @Get('items')
  @RequirePermissions('catalog.view')
  getItems(@Query('categoryId') categoryId?: string) { return this.catalogService.findItems(categoryId); }

  @Post('items/:id/request')
  @RequirePermissions('catalog.request')
  submitRequest(@Param('id') id: string, @Body() body: any, @CurrentUser() user: UserEntity) {
    return this.catalogService.submitRequest(id, user.id, body.fieldValues ?? {});
  }
}
