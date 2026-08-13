import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { ApiAdminEndpoint, ApiEndpoint, ApiPublicEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { AdminMfaService } from '../application/admin-mfa.service.js';
import { AuthCookieService } from '../application/auth-cookie.service.js';
import { AuthService } from '../application/auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyAdminMfaDto } from './dto/mfa.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly mfa: AdminMfaService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Public()
  @Get('csrf')
  @ApiPublicEndpoint('Issue a browser CSRF cookie.')
  async csrf(@Res({ passthrough: true }) response: Response) {
    return {
      data: {
        csrfToken: this.cookies.issueCsrfCookie(response)
      }
    };
  }

  @Public()
  @Post('login')
  @RateLimit({ limit: 10, windowSeconds: 60, keyPrefix: 'admin-login' })
  @UseGuards(RateLimitGuard)
  @ApiEndpoint({ summary: 'Login as an admin or vendor user.', auth: 'none', tenant: 'none', status: 200 })
  @ApiOkResponse({ description: 'Sets access and refresh cookies.' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(dto, {
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null
    });
    this.cookies.setAuthCookies(response, result.tokens);
    this.cookies.issueCsrfCookie(response);
    return { data: result.user };
  }

  @Public()
  @Post('refresh')
  @ApiEndpoint({ summary: 'Rotate the refresh session and issue a new access cookie.', auth: 'none', tenant: 'none', csrf: true })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    this.cookies.assertCsrf({
      cookies,
      headers: request.headers
    });
    const result = await this.auth.refresh(cookies?.refresh_token, {
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null
    });
    this.cookies.setAuthCookies(response, result.tokens);
    this.cookies.issueCsrfCookie(response);
    return { data: result.user };
  }

  @Get('me')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiAdminEndpoint('Return the authenticated admin or vendor user.')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return {
      data: this.auth.safeUser({
        sub: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        sessionId: user.sessionId,
        tenantIds: user.tenantIds,
        permissions: user.permissions,
        mfaRequired: user.mfaRequired ?? false,
        mfaVerified: user.mfaVerified ?? true
      })
    };
  }

  @Post('mfa/setup')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAccessAuthGuard, CsrfGuard)
  @ApiAdminEndpoint('Start admin TOTP MFA setup.', { csrf: true, status: 201 })
  async setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return { data: await this.mfa.setup(user.id) };
  }

  @Post('mfa/verify')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAccessAuthGuard, CsrfGuard)
  @ApiAdminEndpoint('Verify admin TOTP MFA code.', { csrf: true, status: 201 })
  async verifyMfa(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyAdminMfaDto) {
    return { data: await this.mfa.verify(user.id, dto.code) };
  }

  @Post('mfa/disable')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAccessAuthGuard, CsrfGuard)
  @ApiAdminEndpoint('Disable admin TOTP MFA.', { csrf: true, status: 201 })
  async disableMfa(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyAdminMfaDto) {
    return { data: await this.mfa.disable(user.id, dto.code) };
  }

  @Post('logout')
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAccessAuthGuard, CsrfGuard)
  @ApiAdminEndpoint('Revoke the current session and clear auth cookies.', { csrf: true, status: 201 })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(user);
    this.cookies.clearAuthCookies(response);
    return { data: { ok: true } };
  }
}
