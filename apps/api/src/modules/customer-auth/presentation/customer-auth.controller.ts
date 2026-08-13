import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OAuthProvider } from '@prisma/client';
import type { Request, Response } from 'express';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { ApiCustomerEndpoint, ApiEndpoint, ApiPublicEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { authExceptions } from '../../../common/errors/auth-contract.exception.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { CustomerAccessAuthGuard } from '../../../common/guards/customer-access-auth.guard.js';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { CustomerAuthCookieService } from '../application/customer-auth-cookie.service.js';
import { CustomerAuthService } from '../application/customer-auth.service.js';
import { CustomerOAuthService } from '../application/customer-oauth.service.js';
import { CustomerLoginDto, CustomerSignupDto } from './dto/customer-auth.dto.js';

const cartSessionCookie = 'cart_session_id';

@ApiTags('customer-auth')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly auth: CustomerAuthService,
    private readonly oauth: CustomerOAuthService,
    private readonly cookies: CustomerAuthCookieService,
  ) {}

  @Public()
  @Get('csrf')
  @ApiPublicEndpoint('Issue a browser CSRF cookie for customer auth.')
  async csrf(@Res({ passthrough: true }) response: Response) {
    return { data: { csrfToken: this.cookies.issueCsrfCookie(response) } };
  }

  @Public()
  @Post('signup')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @RateLimit({ limit: 8, windowSeconds: 60, keyPrefix: 'customer-signup' })
  @UseGuards(RateLimitGuard, TenantScopeGuard)
  @ApiEndpoint({ summary: 'Create a customer account.', tenant: 'required', auth: 'none', csrf: true })
  @ApiOkResponse({ description: 'Sets customer access and refresh cookies.' })
  async signup(
    @CurrentTenant() tenantId: string,
    @Body() dto: CustomerSignupDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    this.cookies.assertCsrf({ cookies, headers: request.headers });
    const result = await this.auth.signup(tenantId, cookies?.[cartSessionCookie], dto, {
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null
    });
    this.cookies.setAuthCookies(response, result.tokens);
    this.cookies.issueCsrfCookie(response);
    return { data: result.user };
  }

  @Public()
  @Post('login')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @RateLimit({ limit: 12, windowSeconds: 60, keyPrefix: 'customer-login' })
  @UseGuards(RateLimitGuard, TenantScopeGuard)
  @ApiEndpoint({ summary: 'Login as a customer.', tenant: 'required', auth: 'none', csrf: true })
  @ApiOkResponse({ description: 'Sets customer access and refresh cookies.' })
  async login(
    @CurrentTenant() tenantId: string,
    @Body() dto: CustomerLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    this.cookies.assertCsrf({ cookies, headers: request.headers });
    const result = await this.auth.login(tenantId, cookies?.[cartSessionCookie], dto, {
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null
    });
    this.cookies.setAuthCookies(response, result.tokens);
    this.cookies.issueCsrfCookie(response);
    return { data: result.user };
  }

  @Public()
  @Get('oauth/:provider/start')
  @ApiParam({ name: 'provider', enum: OAuthProvider })
  @ApiQuery({ name: 'redirectTo', required: false })
  @ApiQuery({ name: 'tenant', required: true })
  @ApiPublicEndpoint('Start a customer OAuth2 sign-in flow.')
  async oauthStart(
    @Param('provider') provider: OAuthProvider,
    @Query('redirectTo') redirectTo: string | undefined,
    @Query('tenant') tenantId: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!tenantId) {
      throw authExceptions.tenantRequired();
    }
    const result = await this.oauth.start({
      provider,
      tenantId,
      ...(redirectTo ? { redirectTo } : {})
    });
    response.redirect(result.authorizationUrl);
  }

  @Public()
  @Get('oauth/:provider/callback')
  @ApiParam({ name: 'provider', enum: OAuthProvider })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiPublicEndpoint('Complete a customer OAuth2 sign-in flow.')
  async oauthCallback(
    @Param('provider') provider: OAuthProvider,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.oauth.complete({
      provider,
      ...(code ? { code } : {}),
      ...(state ? { state } : {}),
      context: {
        ipAddress: request.ip ?? null,
        userAgent: request.headers['user-agent'] ?? null
      }
    });
    this.cookies.setAuthCookies(response, result.tokens);
    this.cookies.issueCsrfCookie(response);
    response.redirect(this.webRedirect(result.redirectTo));
  }

  @Public()
  @Post('refresh')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(TenantScopeGuard)
  @ApiEndpoint({ summary: 'Rotate the customer refresh session.', tenant: 'required', auth: 'none', csrf: true })
  async refresh(
    @CurrentTenant() tenantId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    this.cookies.assertCsrf({ cookies, headers: request.headers });
    const result = await this.auth.refresh(cookies?.customer_refresh_token, tenantId, {
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null
    });
    this.cookies.setAuthCookies(response, result.tokens);
    this.cookies.issueCsrfCookie(response);
    return { data: result.user };
  }

  @Get('me')
  @ApiCookieAuth('customer_access_token')
  @UseGuards(CustomerAccessAuthGuard, TenantScopeGuard)
  @ApiCustomerEndpoint('Return the authenticated customer.', { tenant: 'required' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        sessionId: user.sessionId,
        tenantIds: user.tenantIds
      }
    };
  }

  @Post('logout')
  @ApiCookieAuth('customer_access_token')
  @UseGuards(CustomerAccessAuthGuard, CsrfGuard, TenantScopeGuard)
  @ApiCustomerEndpoint('Revoke the current customer session.', { tenant: 'required', csrf: true, status: 201 })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(user.id, user.sessionId, tenantId);
    this.cookies.clearAuthCookies(response);
    return { data: { ok: true } };
  }

  private webRedirect(path: string) {
    const baseUrl = process.env.WEB_APP_URL ?? 'http://localhost:3000';
    return new URL(path, baseUrl).toString();
  }
}
