import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../database/tenant/entities/user.entity';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.loginWithPassword(dto.email, dto.password);
    this.setTokenCookies(res, tokens);
    return { message: 'Login realizado com sucesso', expiresIn: tokens.expiresIn };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens usando refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setTokenCookies(res, tokens);
    return { message: 'Tokens renovados', expiresIn: tokens.expiresIn };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout — limpa cookies' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_OPTS);
    res.clearCookie('refresh_token', COOKIE_OPTS);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna usuário autenticado' })
  me(@CurrentUser() user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roleId: user.roleId,
      department: user.department,
      ssoProvider: user.ssoProvider,
    };
  }

  // ─── Google SSO ──────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Inicia fluxo SSO Google' })
  googleAuth() {
    // Passport redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback SSO Google' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = (req as any).user as any;
    this.setTokenCookies(res, tokens);
    res.redirect(`${process.env.FRONTEND_URL ?? '/'}/dashboard`);
  }

  // ─── Microsoft SSO ───────────────────────────────────────────────────────────

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Inicia fluxo SSO Microsoft' })
  microsoftAuth() {
    // Passport redirect
  }

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Callback SSO Microsoft' })
  async microsoftCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = (req as any).user as any;
    this.setTokenCookies(res, tokens);
    res.redirect(`${process.env.FRONTEND_URL ?? '/'}/dashboard`);
  }

  private setTokenCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      ...COOKIE_OPTS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
