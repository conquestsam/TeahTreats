import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import type {
  AdminReportsDashboardSummary,
  OrdersByStatusReportItem,
  RepeatCustomerReport,
  RevenueByDayReportItem,
  SalesSummaryReport,
  StockReportItem,
  TopProductReportItem
} from '@snacks/shared';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

const revenueStatuses: OrderStatus[] = [
  OrderStatus.paid,
  OrderStatus.preparing,
  OrderStatus.ready_for_pickup,
  OrderStatus.ready_for_pickup_dispatch,
  OrderStatus.completed
];

const openManualPaymentStatuses: PaymentStatus[] = [
  PaymentStatus.manual_proof_submitted,
  PaymentStatus.awaiting_admin_approval
];

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboardForScope(
    tenantIdOrSlug: string,
    accessibleTenantIds: string[],
    input: { from?: string; to?: string },
    canManageAllTenants = false,
  ): Promise<AdminReportsDashboardSummary> {
    if (tenantIdOrSlug !== 'all') {
      return this.dashboard(tenantIdOrSlug, input);
    }
    const tenantIds = canManageAllTenants
      ? (await this.prisma.tenant.findMany({
        where: { active: true },
        select: { id: true }
      })).map((tenant) => tenant.id)
      : [...new Set(accessibleTenantIds)].filter(Boolean);
    if (tenantIds.length === 0) {
      throw new BadRequestException('No tenant access is available for reporting.');
    }
    const dashboards = await Promise.all(tenantIds.map((tenantId) => this.dashboard(tenantId, input)));
    return this.mergeDashboards(dashboards);
  }

  async dashboard(tenantIdOrSlug: string, input: { from?: string; to?: string }): Promise<AdminReportsDashboardSummary> {
    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    const range = this.dateRange(input);
    const [
      salesSummary,
      revenueByDay,
      ordersByStatus,
      topProducts,
      lowStock,
      expiredStock,
      manualPaymentPendingCount,
      repeatCustomers
    ] = await Promise.all([
      this.salesSummaryByTenant(tenantId, range),
      this.revenueByDayByTenant(tenantId, range),
      this.ordersByStatusByTenant(tenantId, range),
      this.topProductsByTenant(tenantId, range),
      this.lowStockByTenant(tenantId),
      this.expiredStockByTenant(tenantId),
      this.manualPaymentPendingCountByTenant(tenantId),
      this.repeatCustomersByTenant(tenantId, range)
    ]);

    return {
      salesSummary,
      revenueByDay,
      ordersByStatus,
      topProducts,
      lowStock,
      expiredStock,
      manualPaymentPendingCount,
      repeatCustomers
    };
  }

  async salesSummary(tenantIdOrSlug: string, input: { from?: string; to?: string }) {
    return this.salesSummaryByTenant(await this.resolveTenantId(tenantIdOrSlug), this.dateRange(input));
  }

  async revenueByDay(tenantIdOrSlug: string, input: { from?: string; to?: string }) {
    return this.revenueByDayByTenant(await this.resolveTenantId(tenantIdOrSlug), this.dateRange(input));
  }

  async ordersByStatus(tenantIdOrSlug: string, input: { from?: string; to?: string }) {
    return this.ordersByStatusByTenant(await this.resolveTenantId(tenantIdOrSlug), this.dateRange(input));
  }

  async topProducts(tenantIdOrSlug: string, input: { from?: string; to?: string }) {
    return this.topProductsByTenant(await this.resolveTenantId(tenantIdOrSlug), this.dateRange(input));
  }

  async lowStock(tenantIdOrSlug: string) {
    return this.lowStockByTenant(await this.resolveTenantId(tenantIdOrSlug));
  }

  async expiredStock(tenantIdOrSlug: string) {
    return this.expiredStockByTenant(await this.resolveTenantId(tenantIdOrSlug));
  }

  async manualPaymentPendingCount(tenantIdOrSlug: string) {
    return { count: await this.manualPaymentPendingCountByTenant(await this.resolveTenantId(tenantIdOrSlug)) };
  }

  async repeatCustomers(tenantIdOrSlug: string, input: { from?: string; to?: string }) {
    return this.repeatCustomersByTenant(await this.resolveTenantId(tenantIdOrSlug), this.dateRange(input));
  }

  private async salesSummaryByTenant(tenantId: string, range: DateRange): Promise<SalesSummaryReport> {
    const [allOrders, revenueOrders, currencyOrder] = await Promise.all([
      this.prisma.order.count({
        where: { tenantId, createdAt: { gte: range.from, lte: range.to } }
      }),
      this.prisma.order.aggregate({
        where: {
          tenantId,
          status: { in: revenueStatuses },
          createdAt: { gte: range.from, lte: range.to }
        },
        _count: { _all: true },
        _sum: {
          totalCents: true,
          subtotalCents: true,
          discountCents: true
        }
      }),
      this.prisma.order.findFirst({
        where: { tenantId },
        select: { currency: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const netRevenueCents = revenueOrders._sum.totalCents ?? 0;
    const paidOrderCount = revenueOrders._count._all;
    return {
      range: this.rangeSummary(range),
      grossRevenueCents: revenueOrders._sum.subtotalCents ?? netRevenueCents,
      netRevenueCents,
      discountCents: revenueOrders._sum.discountCents ?? 0,
      orderCount: allOrders,
      paidOrderCount,
      averageOrderValueCents: paidOrderCount > 0 ? Math.round(netRevenueCents / paidOrderCount) : 0,
      currency: currencyOrder?.currency ?? 'USD'
    };
  }

  private async revenueByDayByTenant(tenantId: string, range: DateRange): Promise<RevenueByDayReportItem[]> {
    const rows = await this.prisma.$queryRaw<Array<{ day: Date; revenue_cents: bigint | number | null; order_count: bigint | number }>>`
      SELECT date_trunc('day', "createdAt") AS day,
             COALESCE(SUM("totalCents"), 0) AS revenue_cents,
             COUNT(*) AS order_count
      FROM "Order"
      WHERE "tenantId" = ${tenantId}
        AND "status" IN (${Prisma.join(revenueStatuses)})
        AND "createdAt" >= ${range.from}
        AND "createdAt" <= ${range.to}
      GROUP BY day
      ORDER BY day ASC
    `;

    return rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      revenueCents: Number(row.revenue_cents ?? 0),
      orderCount: Number(row.order_count)
    }));
  }

  private async ordersByStatusByTenant(tenantId: string, range: DateRange): Promise<OrdersByStatusReportItem[]> {
    const rows = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        tenantId,
        createdAt: { gte: range.from, lte: range.to }
      },
      _count: { _all: true },
      orderBy: { status: 'asc' }
    });

    return rows.map((row) => ({
      status: row.status,
      count: row._count._all
    }));
  }

  private async topProductsByTenant(tenantId: string, range: DateRange): Promise<TopProductReportItem[]> {
    const rows = await this.prisma.$queryRaw<Array<{
      product_name: string;
      sku_name: string;
      quantity_sold: bigint | number;
      revenue_cents: bigint | number | null;
    }>>`
      SELECT oi."productName" AS product_name,
             oi."skuName" AS sku_name,
             COALESCE(SUM(oi."quantity"), 0) AS quantity_sold,
             COALESCE(SUM(oi."lineTotalCents"), 0) AS revenue_cents
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."tenantId" = ${tenantId}
        AND o."status" IN (${Prisma.join(revenueStatuses)})
        AND o."createdAt" >= ${range.from}
        AND o."createdAt" <= ${range.to}
      GROUP BY oi."productName", oi."skuName"
      ORDER BY quantity_sold DESC, revenue_cents DESC
      LIMIT 10
    `;

    return rows.map((row) => ({
      productName: row.product_name,
      skuName: row.sku_name,
      quantitySold: Number(row.quantity_sold),
      revenueCents: Number(row.revenue_cents ?? 0)
    }));
  }

  private async lowStockByTenant(tenantId: string): Promise<StockReportItem[]> {
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId,
        expiredAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: { sku: { include: { product: true } } },
      orderBy: [{ quantity: 'asc' }, { updatedAt: 'desc' }],
      take: 50
    });

    return batches
      .map((batch) => this.toStockItem(batch))
      .filter((item) => item.available <= 10)
      .slice(0, 10);
  }

  private async expiredStockByTenant(tenantId: string): Promise<StockReportItem[]> {
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId,
        OR: [
          { expiredAt: { not: null } },
          { expiresAt: { lte: new Date() } }
        ]
      },
      include: { sku: { include: { product: true } } },
      orderBy: [{ expiresAt: 'asc' }, { updatedAt: 'desc' }],
      take: 10
    });

    return batches.map((batch) => this.toStockItem(batch));
  }

  private async manualPaymentPendingCountByTenant(tenantId: string) {
    return this.prisma.payment.count({
      where: {
        tenantId,
        provider: PaymentProvider.manual,
        status: { in: openManualPaymentStatuses }
      }
    });
  }

  private async repeatCustomersByTenant(tenantId: string, range: DateRange): Promise<RepeatCustomerReport> {
    const rows = await this.prisma.$queryRaw<Array<{ customer_key: string; order_count: bigint | number }>>`
      SELECT COALESCE("userId", customer->>'email', customer->>'phone') AS customer_key,
             COUNT(*) AS order_count
      FROM "Order"
      WHERE "tenantId" = ${tenantId}
        AND "createdAt" >= ${range.from}
        AND "createdAt" <= ${range.to}
        AND COALESCE("userId", customer->>'email', customer->>'phone') IS NOT NULL
      GROUP BY customer_key
    `;

    const knownCustomerCount = rows.length;
    const repeatRows = rows.filter((row) => Number(row.order_count) > 1);
    return {
      knownCustomerCount,
      repeatCustomerCount: repeatRows.length,
      repeatOrderCount: repeatRows.reduce((sum, row) => sum + Number(row.order_count), 0)
    };
  }

  private toStockItem(batch: InventoryBatchWithSku): StockReportItem {
    return {
      batchId: batch.id,
      skuId: batch.skuId,
      skuName: batch.sku.name,
      productName: batch.sku.product.name,
      quantity: batch.quantity,
      reserved: batch.reserved,
      available: Math.max(0, batch.quantity - batch.reserved),
      expiresAt: batch.expiresAt?.toISOString() ?? null
    };
  }

  private dateRange(input: { from?: string; to?: string }): DateRange {
    const to = input.to ? new Date(input.to) : new Date();
    const from = input.from ? new Date(input.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Report date range is invalid.');
    }
    if (from > to) {
      throw new BadRequestException('Report start date must be before end date.');
    }
    const maxDays = 370;
    if (to.getTime() - from.getTime() > maxDays * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Report date range cannot exceed 370 days.');
    }
    return { from, to };
  }

  private rangeSummary(range: DateRange) {
    return {
      from: range.from.toISOString(),
      to: range.to.toISOString()
    };
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new BadRequestException('Tenant was not found.');
    }
    return tenant.id;
  }

  private mergeDashboards(dashboards: AdminReportsDashboardSummary[]): AdminReportsDashboardSummary {
    const first = dashboards[0];
    if (!first) {
      throw new BadRequestException('No report data is available.');
    }
    const currency = first.salesSummary.currency;
    const sales = dashboards.reduce(
      (acc, dashboard) => ({
        grossRevenueCents: acc.grossRevenueCents + dashboard.salesSummary.grossRevenueCents,
        netRevenueCents: acc.netRevenueCents + dashboard.salesSummary.netRevenueCents,
        discountCents: acc.discountCents + dashboard.salesSummary.discountCents,
        orderCount: acc.orderCount + dashboard.salesSummary.orderCount,
        paidOrderCount: acc.paidOrderCount + dashboard.salesSummary.paidOrderCount
      }),
      { grossRevenueCents: 0, netRevenueCents: 0, discountCents: 0, orderCount: 0, paidOrderCount: 0 },
    );

    const revenueByDate = new Map<string, RevenueByDayReportItem>();
    for (const item of dashboards.flatMap((dashboard) => dashboard.revenueByDay)) {
      const current = revenueByDate.get(item.date) ?? { date: item.date, revenueCents: 0, orderCount: 0 };
      current.revenueCents += item.revenueCents;
      current.orderCount += item.orderCount;
      revenueByDate.set(item.date, current);
    }

    const statusCounts = new Map<string, number>();
    for (const item of dashboards.flatMap((dashboard) => dashboard.ordersByStatus)) {
      statusCounts.set(item.status, (statusCounts.get(item.status) ?? 0) + item.count);
    }

    const topProducts = new Map<string, TopProductReportItem>();
    for (const item of dashboards.flatMap((dashboard) => dashboard.topProducts)) {
      const key = `${item.productName}:${item.skuName}`;
      const current = topProducts.get(key) ?? { ...item, quantitySold: 0, revenueCents: 0 };
      current.quantitySold += item.quantitySold;
      current.revenueCents += item.revenueCents;
      topProducts.set(key, current);
    }

    return {
      salesSummary: {
        range: first.salesSummary.range,
        grossRevenueCents: sales.grossRevenueCents,
        netRevenueCents: sales.netRevenueCents,
        discountCents: sales.discountCents,
        orderCount: sales.orderCount,
        paidOrderCount: sales.paidOrderCount,
        averageOrderValueCents: sales.paidOrderCount > 0 ? Math.round(sales.netRevenueCents / sales.paidOrderCount) : 0,
        currency
      },
      revenueByDay: [...revenueByDate.values()].sort((left, right) => left.date.localeCompare(right.date)),
      ordersByStatus: [...statusCounts.entries()].map(([status, count]) => ({ status, count })).sort((left, right) => left.status.localeCompare(right.status)),
      topProducts: [...topProducts.values()].sort((left, right) => right.quantitySold - left.quantitySold).slice(0, 10),
      lowStock: dashboards.flatMap((dashboard) => dashboard.lowStock).slice(0, 20),
      expiredStock: dashboards.flatMap((dashboard) => dashboard.expiredStock).slice(0, 20),
      manualPaymentPendingCount: dashboards.reduce((sum, dashboard) => sum + dashboard.manualPaymentPendingCount, 0),
      repeatCustomers: {
        knownCustomerCount: dashboards.reduce((sum, dashboard) => sum + dashboard.repeatCustomers.knownCustomerCount, 0),
        repeatCustomerCount: dashboards.reduce((sum, dashboard) => sum + dashboard.repeatCustomers.repeatCustomerCount, 0),
        repeatOrderCount: dashboards.reduce((sum, dashboard) => sum + dashboard.repeatCustomers.repeatOrderCount, 0)
      }
    };
  }
}

interface DateRange {
  from: Date;
  to: Date;
}

type InventoryBatchWithSku = Prisma.InventoryBatchGetPayload<{
  include: { sku: { include: { product: true } } };
}>;
