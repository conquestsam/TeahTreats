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
import { PromotionsService } from '../application/promotions.service.js';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto.js';

@ApiTags('admin/promotions')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/promotions')
export class AdminPromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Get()
  @RequirePermissions(permissions.promotionsRead)
  @ApiAdminEndpoint('List tenant promotions.', { tenant: 'optional' })
  async list(@CurrentTenant() tenantId: string) {
    return { data: await this.promotions.listAdminPromotions(tenantId) };
  }

  @Post()
  @RequirePermissions(permissions.promotionsWrite)
  @ApiAdminEndpoint('Create a tenant promotion.', { tenant: 'optional' })
  async create(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return { data: await this.promotions.createPromotion(actor, tenantId, dto) };
  }

  @Patch(':promotionId')
  @RequirePermissions(permissions.promotionsWrite)
  @ApiAdminEndpoint('Update a tenant promotion.', { tenant: 'optional' })
  async update(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('promotionId') promotionId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return { data: await this.promotions.updatePromotion(actor, tenantId, promotionId, dto) };
  }

  @Post(':promotionId/archive')
  @RequirePermissions(permissions.promotionsWrite)
  @ApiAdminEndpoint('Archive a tenant promotion.', { tenant: 'optional' })
  async archive(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('promotionId') promotionId: string,
  ) {
    return { data: await this.promotions.archivePromotion(actor, tenantId, promotionId) };
  }
}
