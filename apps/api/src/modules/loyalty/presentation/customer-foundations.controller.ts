import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { OptionalCustomerAuthGuard } from '../../../common/guards/optional-customer-auth.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { LoyaltyFoundationsService } from '../application/loyalty-foundations.service.js';
import { AddGroupCartItemDto, CreateBundlePreviewDto, CreateGroupCartDto, CreateSnackPlanDto } from './dto/loyalty-foundations.dto.js';

const cartSessionCookie = 'cart_session_id';

@Controller()
@ApiTags('shop/foundations')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(OptionalCustomerAuthGuard, TenantScopeGuard)
export class CustomerFoundationsController {
  constructor(private readonly foundations: LoyaltyFoundationsService) {}

  @Post('shop/bundles/preview')
  @ApiOperation({ summary: 'Generate a dynamic bundle preview.' })
  async bundlePreview(@CurrentTenant() tenantId: string, @Body() dto: CreateBundlePreviewDto) {
    return { data: await this.foundations.createBundlePreview(tenantId, dto) };
  }

  @Post('shop/office-snack-plans')
  @ApiOperation({ summary: 'Create a backend-generated office snack plan.' })
  async createSnackPlan(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateSnackPlanDto,
  ) {
    return { data: await this.foundations.createSnackPlan(tenantId, user, dto) };
  }

  @Get('shop/group-carts')
  @ApiOperation({ summary: 'List current customer group carts.' })
  async myGroupCarts(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return { data: await this.foundations.getMyGroupCarts(tenantId, user) };
  }

  @Post('shop/group-carts')
  @ApiOperation({ summary: 'Create a group cart.' })
  async createGroupCart(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateGroupCartDto,
  ) {
    return { data: await this.foundations.createGroupCart(tenantId, user, dto) };
  }

  @Post('shop/group-carts/:groupCartId/items')
  @ApiOperation({ summary: 'Add an item to a group cart intent.' })
  async addGroupCartItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('groupCartId') groupCartId: string,
    @Body() dto: AddGroupCartItemDto,
  ) {
    return { data: await this.foundations.addGroupCartItem(tenantId, user, groupCartId, dto) };
  }

  @Post('shop/group-carts/:groupCartId/merge')
  @ApiOperation({ summary: 'Copy group cart items into the checkout cart.' })
  async mergeGroupCart(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('groupCartId') groupCartId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    return { data: await this.foundations.mergeGroupCart(tenantId, groupCartId, sessionId, user) };
  }

  private ensureCartSession(request: Request, response: Response) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    const existingSessionId = cookies?.[cartSessionCookie];
    if (existingSessionId) return existingSessionId;
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
