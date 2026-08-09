import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { OptionalCustomerAuthGuard } from '../../../common/guards/optional-customer-auth.guard.js';
import { IdempotencyKey } from '../../../common/decorators/idempotency-key.decorator.js';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { CheckoutService } from '../application/checkout.service.js';
import { StartCheckoutDto } from './dto/checkout.dto.js';

const cartSessionCookie = 'cart_session_id';

@ApiTags('shop/checkout')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(OptionalCustomerAuthGuard, TenantScopeGuard)
@Controller('shop/checkout')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly config: ConfigService,
  ) {}

  @Post('start')
  @RateLimit({ limit: 6, windowSeconds: 60, keyPrefix: 'checkout-start' })
  @UseGuards(RateLimitGuard, CsrfGuard, OptionalCustomerAuthGuard, TenantScopeGuard)
  @ApiOperation({ summary: 'Start checkout and reserve inventory.' })
  async start(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @IdempotencyKey() idempotencyKey: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() dto: StartCheckoutDto,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    return { data: await this.checkout.startCheckout(tenantId, sessionId, idempotencyKey, dto, user) };
  }

  private ensureCartSession(request: Request, response: Response) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    const existingSessionId = cookies?.[cartSessionCookie];
    if (existingSessionId) {
      return existingSessionId;
    }

    const sessionId = randomUUID();
    response.cookie(cartSessionCookie, sessionId, {
      ...this.cartCookieOptions(),
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    return sessionId;
  }

  private cartCookieOptions() {
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    const sameSite = this.config.get<'lax' | 'strict' | 'none'>('AUTH_COOKIE_SAMESITE') ?? 'lax';
    const configuredSecure = this.config.get<boolean | undefined>('AUTH_COOKIE_SECURE');
    const secure = configuredSecure ?? (this.config.get<string>('NODE_ENV') === 'production' || sameSite === 'none');
    return {
      sameSite,
      secure,
      ...(domain ? { domain } : {})
    };
  }
}
