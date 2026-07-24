import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. httpOnly cookie (primary)
        (req: Request) => req?.cookies?.access_token ?? null,
        // 2. Bearer header (for API clients)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET') || 'dev-secret-key-fallback-for-testing',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') throw new UnauthorizedException();
    const user = await this.authService.getUserById(payload.sub);
    return user;
  }
}
