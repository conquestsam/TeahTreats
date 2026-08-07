import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get tenant operation settings.' })
  async getSettings(@CurrentUser() actor: AuthenticatedUser, @CurrentTenant() tenantId: string) {
    return { data: await this.settings.getSettings(actor, tenantId) };
  }

  @Patch('business-profile')
  @RequirePermissions(permissions.tenantsManage)
  @ApiOperation({ summary: 'Update tenant business profile settings.' })
  async updateBusinessProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    return { data: await this.settings.updateBusinessProfile(actor, tenantId, dto) };
  }

  @Patch('approval')
  @RequirePermissions(permissions.tenantsManage)
  @ApiOperation({ summary: 'Update tenant approval rules.' })
  async updateApprovalSettings(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateApprovalSettingsDto,
  ) {
    return { data: await this.settings.updateApprovalSettings(actor, tenantId, dto) };
  }

  @Patch('notifications')
  @RequirePermissions(permissions.tenantsManage)
  @ApiOperation({ summary: 'Update tenant notification channels.' })
  async updateNotificationChannels(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateNotificationChannelsDto,
  ) {
    return { data: await this.settings.updateNotificationChannels(actor, tenantId, dto) };
  }

  @Get('manual-payment-methods')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'List tenant manual payment methods.' })
  async listManualPaymentMethods(@CurrentTenant() tenantId: string) {
    return { data: await this.settings.listManualPaymentMethods(tenantId) };
  }

  @Post('manual-payment-methods')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'Create a tenant manual payment method.' })
  async createManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateManualPaymentMethodDto,
  ) {
    return { data: await this.settings.createManualPaymentMethod(actor, tenantId, dto) };
  }

  @Patch('manual-payment-methods/:methodId')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'Update a tenant manual payment method.' })
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
  @ApiOperation({ summary: 'Activate a tenant manual payment method.' })
  async activateManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('methodId') methodId: string,
  ) {
    return { data: await this.settings.setManualPaymentMethodStatus(actor, tenantId, methodId, true) };
  }

  @Post('manual-payment-methods/:methodId/deactivate')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'Deactivate a tenant manual payment method.' })
  async deactivateManualPaymentMethod(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('methodId') methodId: string,
  ) {
    return { data: await this.settings.setManualPaymentMethodStatus(actor, tenantId, methodId, false) };
  }
}
