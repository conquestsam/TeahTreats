import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { VendorService } from '../application/vendor.service.js';

@ApiTags('vendor')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Current vendor tenant context.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendor: VendorService) {}

  @Get('dashboard')
  @RequirePermissions(permissions.productsRead)
  @ApiAdminEndpoint('Get a tenant-scoped vendor dashboard summary.', { tenant: 'optional' })
  async dashboard(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ) {
    return { data: await this.vendor.getDashboard(actor, tenantId) };
  }

  @Get('products')
  @RequirePermissions(permissions.productsRead)
  @ApiAdminEndpoint('List vendor-scoped products.', { tenant: 'optional' })
  async products(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.vendor.listProducts(actor, tenantId) };
  }

  @Get('products/:productId')
  @RequirePermissions(permissions.productsRead)
  @ApiAdminEndpoint('Get a vendor-scoped product detail.', { tenant: 'optional' })
  async product(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
  ) {
    return { data: await this.vendor.getProduct(actor, tenantId, productId) };
  }

  @Get('inventory')
  @RequirePermissions(permissions.inventoryRead)
  @ApiAdminEndpoint('List vendor-scoped inventory batches.', { tenant: 'optional' })
  async inventory(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.vendor.listInventory(actor, tenantId) };
  }

  @Get('inventory/:batchId')
  @RequirePermissions(permissions.inventoryRead)
  @ApiAdminEndpoint('Get a vendor-scoped inventory batch detail.', { tenant: 'optional' })
  async inventoryBatch(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('batchId') batchId: string,
  ) {
    return { data: await this.vendor.getInventoryBatch(actor, tenantId, batchId) };
  }

  @Get('orders')
  @RequirePermissions(permissions.ordersRead)
  @ApiAdminEndpoint('List vendor-scoped orders.', { tenant: 'optional' })
  async orders(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.vendor.listOrders(actor, tenantId) };
  }

  @Get('orders/:orderId')
  @RequirePermissions(permissions.ordersRead)
  @ApiAdminEndpoint('Get a vendor-scoped order detail.', { tenant: 'optional' })
  async order(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.vendor.getOrder(actor, tenantId, orderId) };
  }
}
