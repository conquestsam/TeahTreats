import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
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
import { CartService } from '../application/cart.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';

const cartSessionCookie = 'cart_session_id';

@ApiTags('shop/cart')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(OptionalCustomerAuthGuard, TenantScopeGuard)
@Controller('shop/cart')
export class CartController {
  constructor(
    private readonly cart: CartService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiEndpoint({ summary: 'Get or create the current guest cart.', tenant: 'required', auth: 'none' })
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
  @ApiEndpoint({ summary: 'Add an item to the current cart.', tenant: 'required', auth: 'none' })
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
  @ApiEndpoint({ summary: 'Update a cart item quantity.', tenant: 'required', auth: 'none' })
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
  @ApiEndpoint({ summary: 'Remove an item from the current cart.', tenant: 'required', auth: 'none' })
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
  @ApiEndpoint({ summary: 'Clear the current cart.', tenant: 'required', auth: 'none' })
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
