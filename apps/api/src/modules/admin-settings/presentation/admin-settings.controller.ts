import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
import { AdminSettingsService } from '../application/admin-settings.service.js';
import {
  CreateManualPaymentMethodDto,
  UpdateApprovalSettingsDto,
  UpdateBusinessProfileDto,
  UpdateManualPaymentMethodDto,
  UpdateNotificationChannelsDto
} from './dto/admin-settings.dto.js';

@ApiTags('admin/settings')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Current tenant context. Tenant IDs from request bodies are ignored.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingsService) {}

  @Get()
  @ApiAdminEndpoint('Get tenant operation settings.', { tenant: 'optional' })
  async getSettings(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.settings.getSettings(actor, tenantId) };
  }

  @Patch('business-profile')
  @RequirePermissions(permissions.tenantsManage)
  @ApiAdminEndpoint('Update tenant business profile settings.', { tenant: 'optional' })
  async updateBusinessProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    return { data: await this.settings.updateBusinessProfile(actor, tenantId, dto) };
  }

  @Patch('approval')
  @RequirePermissions(permissions.tenantsManage)
  @ApiAdminEndpoint('Update tenant approval rules.', { tenant: 'optional' })
  async updateApprovalSettings(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateApprovalSettingsDto,
  ) {
    return { data: await this.settings.updateApprovalSettings(actor, tenantId, dto) };
  }

  @Patch('notifications')
  @RequirePermissions(permissions.tenantsManage)
  @ApiAdminEndpoint('Update tenant notification channels.', { tenant: 'optional' })
  async updateNotificationChannels(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateNotificationChannelsDto,
  ) {
    return { data: await this.settings.updateNotificationChannels(actor, tenantId, dto) };
  }

  @Get('manual-payment-methods')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiAdminEndpoint('List tenant manual payment methods.', { tenant: 'optional' })
  async listManualPaymentMethods(@CurrentTenant() tenantId: string) {
    return { data: await this.settings.listManualPaymentMethods(tenantId) };
  }

  @Post('manual-payment-methods')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiAdminEndpoint('Create a tenant manual payment method.', { tenant: 'optional' })
  async createManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateManualPaymentMethodDto,
  ) {
    return { data: await this.settings.createManualPaymentMethod(actor, tenantId, dto) };
  }

  @Patch('manual-payment-methods/:methodId')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiAdminEndpoint('Update a tenant manual payment method.', { tenant: 'optional' })
  async updateManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('methodId') methodId: string,
    @Body() dto: UpdateManualPaymentMethodDto,
  ) {
    return { data: await this.settings.updateManualPaymentMethod(actor, tenantId, methodId, dto) };
  }

  @Post('manual-payment-methods/:methodId/activate')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiAdminEndpoint('Activate a tenant manual payment method.', { tenant: 'optional' })
  async activateManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('methodId') methodId: string,
  ) {
    return { data: await this.settings.setManualPaymentMethodStatus(actor, tenantId, methodId, true) };
  }

  @Post('manual-payment-methods/:methodId/deactivate')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiAdminEndpoint('Deactivate a tenant manual payment method.', { tenant: 'optional' })
  async deactivateManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('methodId') methodId: string,
  ) {
    return { data: await this.settings.setManualPaymentMethodStatus(actor, tenantId, methodId, false) };
  }
}
