import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('admin.users')
  @ApiOperation({ summary: 'Listar usuários do tenant' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @RequirePermissions('admin.users')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('admin.users')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id/anonymize')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('admin.users')
  @ApiOperation({ summary: 'Anonimizar usuário (Direito ao Esquecimento LGPD)' })
  async anonymize(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.anonymize(id);
  }
}
