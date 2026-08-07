import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { ReportsService } from '../application/reports.service.js';
import { ReportDateRangeQueryDto } from './dto/report-query.dto.js';

@ApiTags('admin/reports')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, TenantScopeGuard, PermissionsGuard)
@RequirePermissions(permissions.reportsRead)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get tenant reporting dashboard aggregates.' })
  async dashboard(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.dashboard(tenantId, query) };
  }

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get tenant sales summary.' })
  async salesSummary(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.salesSummary(tenantId, query) };
  }

  @Get('revenue-by-day')
  @ApiOperation({ summary: 'Get tenant revenue by day.' })
  async revenueByDay(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.revenueByDay(tenantId, query) };
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Get order counts by status.' })
  async ordersByStatus(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.ordersByStatus(tenantId, query) };
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products.' })
  async topProducts(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.topProducts(tenantId, query) };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock report.' })
  async lowStock(@CurrentTenant() tenantId: string) {
    return { data: await this.reports.lowStock(tenantId) };
  }

  @Get('expired-stock')
  @ApiOperation({ summary: 'Get expired stock report.' })
  async expiredStock(@CurrentTenant() tenantId: string) {
    return { data: await this.reports.expiredStock(tenantId) };
  }

  @Get('manual-payment-pending-count')
  @ApiOperation({ summary: 'Get manual payment pending count.' })
  async manualPaymentPendingCount(@CurrentTenant() tenantId: string) {
    return { data: await this.reports.manualPaymentPendingCount(tenantId) };
  }

  @Get('repeat-customers')
  @ApiOperation({ summary: 'Get repeat customer foundation report.' })
  async repeatCustomers(@CurrentTenant() tenantId: string, @Query() query: ReportDateRangeQueryDto) {
    return { data: await this.reports.repeatCustomers(tenantId, query) };
  }
}
