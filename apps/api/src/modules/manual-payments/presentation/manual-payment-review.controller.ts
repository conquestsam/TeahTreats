import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { ManualPaymentReviewService } from '../application/manual-payment-review.service.js';
import { RejectManualProofDto } from './dto/manual-payment-review.dto.js';

@ApiTags('admin/manual-payments')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Development fallback only. Protected routes prefer authenticated tenant context.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/payments/manual')
export class ManualPaymentReviewController {
  constructor(private readonly reviews: ManualPaymentReviewService) {}

  @Get('proofs')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'List pending manual payment proofs.' })
  async listPending(@CurrentTenant() tenantId: string) {
    return { data: await this.reviews.listPending(tenantId) };
  }

  @Post('proofs/:proofId/approve')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'Approve a manual payment proof.' })
  async approve(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('proofId') proofId: string,
  ) {
    return { data: await this.reviews.approve(actor, tenantId, proofId) };
  }

  @Post('proofs/:proofId/reject')
  @RequirePermissions(permissions.manualPaymentsReview)
  @ApiOperation({ summary: 'Reject a manual payment proof.' })
  async reject(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('proofId') proofId: string,
    @Body() dto: RejectManualProofDto,
  ) {
    return { data: await this.reviews.reject(actor, tenantId, proofId, dto.reason) };
  }
}
