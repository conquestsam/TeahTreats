import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { ApiAdminEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { AuditReviewService } from '../application/audit-review.service.js';
import { AuditLogQueryDto } from './dto/audit-query.dto.js';

@ApiTags('admin/audit')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, TenantScopeGuard, PermissionsGuard)
@RequirePermissions(permissions.auditRead)
@Controller('admin/audit')
export class AuditReviewController {
  constructor(private readonly audit: AuditReviewService) {}

  @Get('logs')
  @ApiAdminEndpoint('List recent tenant audit logs for review.', { tenant: 'optional' })
  async list(@CurrentTenant() tenantId: string, @Query() query: AuditLogQueryDto) {
    return { data: await this.audit.list(tenantId, query) };
  }
}
