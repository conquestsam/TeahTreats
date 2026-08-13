import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../../../common/decorators/openapi.decorator.js';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { OptionalCustomerAuthGuard } from '../../../common/guards/optional-customer-auth.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { PromotionsService } from '../application/promotions.service.js';
import { ValidateCouponDto } from './dto/promotion.dto.js';

const cartSessionCookie = 'cart_session_id';

@ApiTags('shop/promotions')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(OptionalCustomerAuthGuard, TenantScopeGuard)
@Controller('shop/promotions')
export class CustomerPromotionsController {
  constructor(
    private readonly promotions: PromotionsService,
    private readonly config: ConfigService,
  ) {}

  @Post('validate-coupon')
  @ApiEndpoint({ summary: 'Validate a coupon against the current cart.', tenant: 'required', auth: 'none' })
  async validateCoupon(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() dto: ValidateCouponDto,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    return { data: await this.promotions.validateCouponForCurrentCart(tenantId, sessionId, dto, user) };
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
