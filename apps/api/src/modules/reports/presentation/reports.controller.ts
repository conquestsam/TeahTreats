import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { ApiAdminEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { ReportsService } from '../application/reports.service.js';
import { ReportDateRangeQueryDto } from './dto/report-query.dto.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';

@ApiTags('admin/reports')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, TenantScopeGuard, PermissionsGuard)
@RequirePermissions(permissions.reportsRead)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions(permissions.dashboardRead)
  @ApiAdminEndpoint('Get tenant reporting dashboard aggregates.', { tenant: 'optional' })
  async dashboard(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReportDateRangeQueryDto,
  ) {
    return {
      data: await this.reports.dashboardForScope(
        tenantId,
        user.tenantIds,
        query,
        user.permissions.includes(permissions.tenantsManage),
      )
    };
  }

  @Get('sales-summary')
  @ApiAdminEndpoint('Get tenant sales summary.', { tenant: 'optional' })
  async salesSummary(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.salesSummary(tenantId, query) };
  }

  @Get('revenue-by-day')
  @ApiAdminEndpoint('Get tenant revenue by day.', { tenant: 'optional' })
  async revenueByDay(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.revenueByDay(tenantId, query) };
  }

  @Get('orders-by-status')
  @ApiAdminEndpoint('Get order counts by status.', { tenant: 'optional' })
  async ordersByStatus(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.ordersByStatus(tenantId, query) };
  }

  @Get('top-products')
  @ApiAdminEndpoint('Get top selling products.', { tenant: 'optional' })
  async topProducts(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.topProducts(tenantId, query) };
  }

  @Get('low-stock')
  @ApiAdminEndpoint('Get low stock report.', { tenant: 'optional' })
  async lowStock(@CurrentTenant() tenantId: string) {
    return { data: await this.reports.lowStock(tenantId) };
  }

  @Get('expired-stock')
  @ApiAdminEndpoint('Get expired stock report.', { tenant: 'optional' })
  async expiredStock(@CurrentTenant() tenantId: string) {
    return { data: await this.reports.expiredStock(tenantId) };
  }

  @Get('manual-payment-pending-count')
  @ApiAdminEndpoint('Get manual payment pending count.', { tenant: 'optional' })
  async manualPaymentPendingCount(@CurrentTenant() tenantId: string) {
    return { data: await this.reports.manualPaymentPendingCount(tenantId) };
  }

  @Get('repeat-customers')
  @ApiAdminEndpoint('Get repeat customer foundation report.', { tenant: 'optional' })
  async repeatCustomers(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.repeatCustomers(tenantId, query) };
  }
}
