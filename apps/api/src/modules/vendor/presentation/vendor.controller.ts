import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
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
  @ApiOperation({ summary: 'Get a tenant-scoped vendor dashboard summary.' })
  async dashboard(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ) {
    return { data: await this.vendor.getDashboard(actor, tenantId) };
  }

  @Get('products')
  @RequirePermissions(permissions.productsRead)
  @ApiOperation({ summary: 'List vendor-scoped products.' })
  async products(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.vendor.listProducts(actor, tenantId) };
  }

  @Get('products/:productId')
  @RequirePermissions(permissions.productsRead)
  @ApiOperation({ summary: 'Get a vendor-scoped product detail.' })
  async product(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
  ) {
    return { data: await this.vendor.getProduct(actor, tenantId, productId) };
  }

  @Get('inventory')
  @RequirePermissions(permissions.inventoryRead)
  @ApiOperation({ summary: 'List vendor-scoped inventory batches.' })
  async inventory(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.vendor.listInventory(actor, tenantId) };
  }

  @Get('inventory/:batchId')
  @RequirePermissions(permissions.inventoryRead)
  @ApiOperation({ summary: 'Get a vendor-scoped inventory batch detail.' })
  async inventoryBatch(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('batchId') batchId: string,
  ) {
    return { data: await this.vendor.getInventoryBatch(actor, tenantId, batchId) };
  }

  @Get('orders')
  @RequirePermissions(permissions.ordersRead)
  @ApiOperation({ summary: 'List vendor-scoped orders.' })
  async orders(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.vendor.listOrders(actor, tenantId) };
  }

  @Get('orders/:orderId')
  @RequirePermissions(permissions.ordersRead)
  @ApiOperation({ summary: 'Get a vendor-scoped order detail.' })
  async order(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return { data: await this.vendor.getOrder(actor, tenantId, orderId) };
  }
}
