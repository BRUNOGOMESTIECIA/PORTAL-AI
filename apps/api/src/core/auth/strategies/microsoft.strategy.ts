import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'openid-client';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserSsoProvider } from '@portal/shared';

// Microsoft/Azure AD uses OIDC. We use a lightweight passport-compatible wrapper.
// In production, use the @acoshift/passport-openidconnect or passport-azure-ad strategy.
// Here we provide the integration contract.

@Injectable()
export class MicrosoftStrategy {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async validate(profile: {
    oid: string;
    preferred_username?: string;
    email?: string;
    name?: string;
    picture?: string;
  }) {
    const email = profile.preferred_username ?? profile.email ?? '';
    const tokens = await this.authService.loginWithSso(
      profile.oid,
      email,
      profile.name ?? email,
      profile.picture ?? null,
      UserSsoProvider.MICROSOFT,
    );
    return tokens;
  }
}
