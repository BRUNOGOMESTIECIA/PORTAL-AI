import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Response } from 'express';
import { AdminMasterService } from './admin-master.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

class CreateTenantDto {
  @IsString() @MinLength(2) name: string;
  @IsString() @MinLength(2) slug: string;
}

class CreateAdminUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(2) name: string;
  @IsString() @MinLength(8) password: string;
}

class MasterLoginDto {
  @IsString() email: string;
  @IsString() password: string;
}

@ApiTags('Admin Master')
@Controller('admin/master')
export class AdminMasterController {
  private readonly logger = new Logger(AdminMasterController.name);

  constructor(
    private readonly service: AdminMasterService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login master admin (sem contexto de tenant)' })
  async login(@Body() dto: MasterLoginDto, @Res({ passthrough: true }) res: Response) {
    const adminEmail = this.config.get('MASTER_ADMIN_EMAIL');
    const adminPassword = this.config.get('MASTER_ADMIN_PASSWORD');

    if (dto.email !== adminEmail || dto.password !== adminPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwtService.sign(
      { sub: 'master', email: adminEmail, role: 'master_admin' },
      { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: '8h' },
    );

    res.cookie('master_token', token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return { message: 'Login realizado', token };
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Lista todos os tenants' })
  listTenants() {
    return this.service.listTenants();
  }

  @Post('tenants')
  @ApiOperation({ summary: 'Cria novo tenant e provisiona banco de dados' })
  async createTenant(@Body() dto: CreateTenantDto) {
    const tenant = await this.service.createTenant(dto.name, dto.slug);
    return {
      message: `Tenant "${dto.slug}" criado com sucesso`,
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
      nextStep: `Adicione DEV_TENANT_SLUG=${dto.slug} no .env, reinicie a API e crie o usuário admin via POST /admin/master/tenants/${dto.slug}/admin-user`,
    };
  }

  @Post('tenants/:slug/admin-user')
  @ApiOperation({ summary: 'Cria usuário administrador no tenant (bootstrap inicial)' })
  async createAdminUser(@Param('slug') slug: string, @Body() dto: CreateAdminUserDto) {
    const user = await this.service.createTenantAdminUser(slug, dto.email, dto.name, dto.password);
    return {
      message: `Usuário admin criado com sucesso no tenant "${slug}"`,
      user,
      nextStep: `Acesse http://localhost:5173 e faça login com ${dto.email}`,
    };
  }
}
