import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { OptionalCustomerAuthGuard } from '../../../common/guards/optional-customer-auth.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { CartService } from '../application/cart.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';

const cartSessionCookie = 'cart_session_id';

@ApiTags('shop/cart')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(OptionalCustomerAuthGuard, TenantScopeGuard)
@Controller('shop/cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get or create the current guest cart.' })
  async getCart(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    if (user?.userType === 'customer') {
      return { data: await this.cart.mergeGuestCartIntoCustomer(tenantId, sessionId, user.id) };
    }
    return { data: await this.cart.getOrCreateCart(tenantId, sessionId) };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the current cart.' })
  async addItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() dto: AddCartItemDto,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    if (user?.userType === 'customer') {
      await this.cart.mergeGuestCartIntoCustomer(tenantId, sessionId, user.id);
    }
    return { data: await this.cart.addItem(tenantId, sessionId, dto) };
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update a cart item quantity.' })
  async updateItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    if (user?.userType === 'customer') {
      await this.cart.mergeGuestCartIntoCustomer(tenantId, sessionId, user.id);
    }
    return { data: await this.cart.updateItem(tenantId, sessionId, itemId, dto) };
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove an item from the current cart.' })
  async removeItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('itemId') itemId: string,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    if (user?.userType === 'customer') {
      await this.cart.mergeGuestCartIntoCustomer(tenantId, sessionId, user.id);
    }
    return { data: await this.cart.removeItem(tenantId, sessionId, itemId) };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the current cart.' })
  async clearCart(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = this.ensureCartSession(request, response);
    if (user?.userType === 'customer') {
      await this.cart.mergeGuestCartIntoCustomer(tenantId, sessionId, user.id);
    }
    return { data: await this.cart.clearCart(tenantId, sessionId) };
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
