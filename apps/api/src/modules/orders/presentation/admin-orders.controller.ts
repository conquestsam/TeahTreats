import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { ApiAdminEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { OrdersService } from '../application/orders.service.js';
import { CancelOrderDto } from './dto/order-management.dto.js';

@ApiTags('admin/orders')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Development fallback only. Protected routes prefer authenticated tenant context.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @RequirePermissions(permissions.ordersRead)
  @ApiAdminEndpoint('List tenant orders for admin management.', { tenant: 'optional' })
  async list(@CurrentTenant() tenantId: string) {
    return { data: await this.orders.listAdminOrders(tenantId) };
  }

  @Get(':orderId')
  @RequirePermissions(permissions.ordersRead)
  @ApiAdminEndpoint('Get one tenant order for admin management.', { tenant: 'optional' })
  async detail(@CurrentTenant() tenantId: string, @Param('orderId') orderId: string) {
    return { data: await this.orders.getAdminOrder(tenantId, orderId) };
  }

  @Post(':orderId/prepare')
  @RequirePermissions(permissions.ordersWrite)
  @ApiAdminEndpoint('Mark a paid order as preparing.', { tenant: 'optional' })
  async prepare(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.orders.markPreparing(actor, tenantId, orderId) };
  }

  @Post(':orderId/ready')
  @RequirePermissions(permissions.ordersWrite)
  @ApiAdminEndpoint('Mark a preparing order as ready for pickup.', { tenant: 'optional' })
  async ready(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.orders.markReady(actor, tenantId, orderId) };
  }

  @Post(':orderId/complete')
  @RequirePermissions(permissions.ordersWrite)
  @ApiAdminEndpoint('Mark a ready order as completed by admin.', { tenant: 'optional' })
  async complete(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.orders.markCompleted(actor, tenantId, orderId) };
  }

  @Post(':orderId/cancel')
  @RequirePermissions(permissions.ordersWrite)
  @ApiAdminEndpoint('Cancel an allowed order and release reservations.', { tenant: 'optional' })
  async cancel(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return { data: await this.orders.cancel(actor, tenantId, orderId, dto.reason) };
  }
}
