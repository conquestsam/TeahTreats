import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  constructor(private readonly promotions: PromotionsService) {}

  @Post('validate-coupon')
  @ApiOperation({ summary: 'Validate a coupon against the current cart.' })
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
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    return sessionId;
  }
}
