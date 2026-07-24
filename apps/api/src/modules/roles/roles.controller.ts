import { Body, Controller, Get, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { RolesService } from './roles.service';

class UpdatePermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('admin.roles')
  findAll() { return this.rolesService.findAll(); }

  @Get('permissions')
  @RequirePermissions('admin.roles')
  findAllPermissions() { return this.rolesService.findAllPermissions(); }

  @Get(':id')
  @RequirePermissions('admin.roles')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.rolesService.findOne(id); }

  @Put(':id/permissions')
  @RequirePermissions('admin.roles')
  @ApiOperation({ summary: 'Atualizar permissões de um perfil' })
  updatePermissions(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePermissionsDto) {
    return this.rolesService.updatePermissions(id, dto.permissionIds);
  }
}
