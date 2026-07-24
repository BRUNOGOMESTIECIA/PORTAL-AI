import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserSsoProvider } from '@portal/shared';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID', ''),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: config.get('GOOGLE_CALLBACK_URL', ''),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email: string = profile.emails?.[0]?.value ?? '';
      const tokens = await this.authService.loginWithSso(
        profile.id,
        email,
        profile.displayName ?? email,
        profile.photos?.[0]?.value ?? null,
        UserSsoProvider.GOOGLE,
      );
      done(null, tokens);
    } catch (err) {
      done(err as Error);
    }
  }
}
