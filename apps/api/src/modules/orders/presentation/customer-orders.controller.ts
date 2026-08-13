import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiCustomerEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { CustomerAccessAuthGuard } from '../../../common/guards/customer-access-auth.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { OrdersService } from '../application/orders.service.js';
import { CompleteCustomerOrderDto } from './dto/order-management.dto.js';

@ApiTags('shop/orders')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'Temporary tenant scope until customer auth is implemented.'
})
@UseGuards(TenantScopeGuard)
@Controller('shop/orders')
export class CustomerOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiCookieAuth('customer_access_token')
  @UseGuards(CustomerAccessAuthGuard, TenantScopeGuard)
  @ApiCustomerEndpoint('List the authenticated customer orders.', { tenant: 'required' })
  async list(@CurrentUser() user: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.orders.listCustomerOrders(user, tenantId) };
  }

  @Get(':orderId')
  @ApiCookieAuth('customer_access_token')
  @UseGuards(CustomerAccessAuthGuard, TenantScopeGuard)
  @ApiCustomerEndpoint('Get one authenticated customer order.', { tenant: 'required' })
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.orders.getCustomerOrder(user, tenantId, orderId) };
  }

  @Post(':orderId/complete')
  @ApiCookieAuth('customer_access_token')
  @UseGuards(CustomerAccessAuthGuard, CsrfGuard, TenantScopeGuard)
  @ApiCustomerEndpoint('Mark a ready order as completed by the authenticated customer.', { tenant: 'required' })
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.orders.completeByAuthenticatedCustomer(user, tenantId, orderId) };
  }

  @Post(':orderId/complete-verified')
  @ApiCustomerEndpoint('Mark a ready order as completed by customer verification.', { tenant: 'required' })
  async completeVerified(
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CompleteCustomerOrderDto,
  ) {
    return { data: await this.orders.completeByCustomer(tenantId, orderId, dto) };
  }
}
