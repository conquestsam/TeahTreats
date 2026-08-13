import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { ApiAdminEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { AdminTenantsService } from '../application/admin-tenants.service.js';
import {
  CreateTenantDto,
  DeactivateTenantDto,
  ReactivateTenantDto,
  UpdateTenantDto
} from './dto/admin-tenant.dto.js';

@ApiTags('admin/tenants')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Current actor tenant context. Tenant IDs from request bodies are ignored.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@RequirePermissions(permissions.tenantsManage)
@Controller('admin/tenants')
export class AdminTenantsController {
  constructor(private readonly tenants: AdminTenantsService) {}

  @Get()
  @ApiAdminEndpoint('List tenants visible to the current actor.', { tenant: 'optional' })
  async listTenants(@CurrentUser() actor: AuthenticatedUser) {
    return { data: await this.tenants.listTenants(actor) };
  }

  @Post()
  @ApiAdminEndpoint('Create a tenant.', { tenant: 'optional' })
  async createTenant(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateTenantDto) {
    return { data: await this.tenants.createTenant(actor, dto) };
  }

  @Get(':tenantId')
  @ApiAdminEndpoint('Get tenant detail.', { tenant: 'optional' })
  async getTenant(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
  ) {
    return { data: await this.tenants.getTenant(actor, tenantId) };
  }

  @Patch(':tenantId')
  @ApiAdminEndpoint('Update tenant settings.', { tenant: 'optional' })
  async updateTenant(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return { data: await this.tenants.updateTenant(actor, tenantId, dto) };
  }

  @Post(':tenantId/deactivate')
  @ApiAdminEndpoint('Deactivate a tenant when it has no unsafe open orders.', { tenant: 'optional' })
  async deactivateTenant(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Body() dto: DeactivateTenantDto,
  ) {
    return { data: await this.tenants.deactivateTenant(actor, tenantId, dto) };
  }

  @Post(':tenantId/reactivate')
  @ApiAdminEndpoint('Reactivate a tenant.', { tenant: 'optional' })
  async reactivateTenant(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Body() dto: ReactivateTenantDto,
  ) {
    return { data: await this.tenants.reactivateTenant(actor, tenantId, dto) };
  }
}
