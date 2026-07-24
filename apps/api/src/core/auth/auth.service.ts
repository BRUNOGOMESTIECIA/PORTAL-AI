import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { getTenantContext } from '../database/tenant.context';
import { TenantDataSourceManager } from '../database/tenant-datasource.manager';
import { UserEntity } from '../database/tenant/entities/user.entity';
import { UserSsoProvider } from '@portal/shared';

export interface JwtPayload {
  sub: string;    // userId
  email: string;
  tenantId: string;
  tenantSlug: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly dsManager: TenantDataSourceManager,
  ) {}

  async loginWithPassword(email: string, password: string): Promise<AuthTokens> {
    const ctx = getTenantContext();
    const userRepo = ctx.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { email, isActive: true } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    await userRepo.update(user.id, { lastLoginAt: new Date() });
    return this.generateTokens(user.id, user.email, ctx.tenantId, ctx.tenantSlug);
  }

  async loginWithSso(
    ssoSubject: string,
    email: string,
    name: string,
    avatarUrl: string | null,
    provider: UserSsoProvider,
  ): Promise<AuthTokens> {
    const ctx = getTenantContext();

    // Domain enforcement
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (
      ctx.ssoAllowedDomains.length > 0 &&
      !ctx.ssoAllowedDomains.some((d) => d.toLowerCase() === emailDomain)
    ) {
      this.logger.warn(`SSO login rejected: domain ${emailDomain} not in allowed list for tenant ${ctx.tenantSlug}`);
      throw new UnauthorizedException(`Domínio de e-mail não autorizado para este tenant`);
    }

    const userRepo = ctx.dataSource.getRepository(UserEntity);
    let user = await userRepo.findOne({ where: { ssoSubject, ssoProvider: provider } });

    if (!user) {
      // Auto-provision user on first SSO login
      user = userRepo.create({
        email,
        name,
        avatarUrl,
        ssoSubject,
        ssoProvider: provider,
        isActive: true,
      });
      await userRepo.save(user);
      this.logger.log(`Auto-provisioned SSO user: ${email} (${ctx.tenantSlug})`);
    } else if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    await userRepo.update(user.id, { lastLoginAt: new Date(), avatarUrl: avatarUrl ?? user.avatarUrl });
    return this.generateTokens(user.id, user.email, ctx.tenantId, ctx.tenantSlug);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException();
      return this.generateTokens(payload.sub, payload.email, payload.tenantId, payload.tenantSlug);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async getUserById(userId: string): Promise<UserEntity> {
    const ctx = getTenantContext();
    const userRepo = ctx.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: userId, isActive: true },
      relations: ['role', 'role.permissions'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  private generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    tenantSlug: string,
  ): AuthTokens {
    const base: Omit<JwtPayload, 'type'> = { sub: userId, email, tenantId, tenantSlug };

    const accessToken = this.jwtService.sign(
      { ...base, type: 'access' },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...base, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
      },
    );

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }
}
