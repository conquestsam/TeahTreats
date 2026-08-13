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
import { InventoryService } from '../application/inventory.service.js';
import {
  AdjustInventoryBatchDto,
  CreateInventoryBatchDto,
  ReserveInventoryDto
} from './dto/inventory.dto.js';

@ApiTags('admin/inventory')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Development fallback only. Protected routes prefer authenticated tenant context.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('batches')
  @RequirePermissions(permissions.inventoryRead)
  @ApiAdminEndpoint('List tenant inventory batches.', { tenant: 'optional' })
  async listBatches(@CurrentTenant() tenantId: string) {
    return { data: await this.inventory.listBatches(tenantId) };
  }

  @Get('sku-options')
  @RequirePermissions(permissions.inventoryRead)
  @ApiAdminEndpoint('List SKUs that can receive inventory.', { tenant: 'optional' })
  async listSkuOptions(@CurrentTenant() tenantId: string) {
    return { data: await this.inventory.listSkuOptions(tenantId) };
  }

  @Get('batches/:batchId')
  @RequirePermissions(permissions.inventoryRead)
  @ApiAdminEndpoint('Get one inventory batch.', { tenant: 'optional' })
  async getBatch(@CurrentTenant() tenantId: string, @Param('batchId') batchId: string) {
    return { data: await this.inventory.getBatch(tenantId, batchId) };
  }

  @Post('batches')
  @RequirePermissions(permissions.inventoryWrite)
  @ApiAdminEndpoint('Create an inventory batch.', { tenant: 'optional' })
  async createBatch(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateInventoryBatchDto,
  ) {
    return { data: await this.inventory.createBatch(actor, tenantId, dto) };
  }

  @Post('batches/:batchId/adjust')
  @RequirePermissions(permissions.inventoryWrite)
  @ApiAdminEndpoint('Adjust batch quantity.', { tenant: 'optional' })
  async adjustBatch(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('batchId') batchId: string,
    @Body() dto: AdjustInventoryBatchDto,
  ) {
    return { data: await this.inventory.adjustBatch(actor, tenantId, batchId, dto) };
  }

  @Post('batches/:batchId/expire')
  @RequirePermissions(permissions.inventoryWrite)
  @ApiAdminEndpoint('Mark a batch expired.', { tenant: 'optional' })
  async expireBatch(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('batchId') batchId: string,
  ) {
    return { data: await this.inventory.expireBatch(actor, tenantId, batchId) };
  }

  @Post('reservations')
  @RequirePermissions(permissions.inventoryWrite)
  @ApiAdminEndpoint('Create a checkout-ready stock reservation foundation.', { tenant: 'optional' })
  async reserveStock(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: ReserveInventoryDto,
  ) {
    return { data: await this.inventory.reserveStock(actor, tenantId, dto) };
  }
}
