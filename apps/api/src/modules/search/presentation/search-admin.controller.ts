import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { SearchAdminService } from '../application/search-admin.service.js';

@ApiTags('admin/search')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/search')
export class SearchAdminController {
  constructor(private readonly search: SearchAdminService) {}

  @Post('products/reindex')
  @RequirePermissions(permissions.productsWrite)
  @ApiOperation({ summary: 'Rebuild the tenant product OpenSearch index from PostgreSQL.' })
  async reindexProducts(@CurrentTenant() tenantId: string) {
    return { data: await this.search.reindexProducts(tenantId) };
  }
}
