'use client';

import { Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { AdminReportBarList } from '@/components/functional-components/AdminReport/AdminReportBarList';
import { AdminReportDateRangeModal } from '@/components/functional-components/AdminReport/AdminReportDateRangeModal';
import {
  AdminStockTable,
  AdminTopProductsTable,
  formatMoney
} from '@/components/functional-components/AdminReport/AdminReportTables';
import { AppPageHeader } from '@/components/ui/app-page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { useAdminReportDateRange } from '@/hooks/AdminReport/useAdminReportDateRange';
import { useAdminReportDashboardQuery } from '@/hooks/AdminReport/useAdminReportQuery';

export function AdminReportContent() {
  const dateRange = useAdminReportDateRange();
  const reportsQuery = useAdminReportDashboardQuery(dateRange.range);
  const report = reportsQuery.data;
  const rangeLabel = dateRange.range.from || dateRange.range.to
    ? `${dateRange.range.from || 'Start'} to ${dateRange.range.to || 'Today'}`
    : 'Last 30 days';

  if (reportsQuery.isLoading) {
    return (
      <div className="admin-container py-6 md:py-8">
        <StateCard loading title="Loading reports..." description="Building tenant aggregates." />
      </div>
    );
  }

  if (reportsQuery.isError) {
    return (
      <div className="admin-container py-6 md:py-8">
        <StateCard
          title="Reports unavailable."
          description={reportsQuery.error instanceof Error ? reportsQuery.error.message : 'Check your session, tenant header, and reports permission.'}
          tone="warning"
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="admin-container py-6 md:py-8">
        <StateCard title="Reports unavailable." description="No report data was returned for this tenant." tone="warning" />
      </div>
    );
  }

  const summary = report.salesSummary;
  const revenueItems = report.revenueByDay.slice(-14).map((item) => ({
    label: new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: item.revenueCents,
    hint: `${item.orderCount} orders`
  }));
  const statusItems = report.ordersByStatus.map((item) => ({
    label: item.status.replaceAll('_', ' '),
    value: item.count
  }));

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AppPageHeader
          eyebrow="Reporting"
          title="Reports"
          description="Track sales, inventory risk, payments, and customer repeat activity for this tenant."
          badge={rangeLabel}
        />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Showing {rangeLabel.toLowerCase()}.
          </Text>
          <Button variant="light" onClick={dateRange.open}>
            Change Date Range
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard
            label="Net revenue"
            value={formatMoney(summary.netRevenueCents, summary.currency)}
            hint={`${summary.paidOrderCount} paid orders`}
            tone="green"
          />
          <MetricCard
            label="Average order"
            value={formatMoney(summary.averageOrderValueCents, summary.currency)}
            hint={`${summary.orderCount} total orders`}
            tone="blue"
          />
          <MetricCard
            label="Discounts"
            value={formatMoney(summary.discountCents, summary.currency)}
            hint="Applied discounts"
            tone="orange"
          />
          <MetricCard
            label="Manual payments"
            value={report.manualPaymentPendingCount}
            hint="Waiting for review"
            tone={report.manualPaymentPendingCount > 0 ? 'orange' : 'gray'}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <AdminReportBarList
            title="Revenue by day"
            items={revenueItems}
            valueLabel={(value) => formatMoney(value, summary.currency)}
          />
          <AdminReportBarList title="Orders by status" items={statusItems} />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <MetricCard
            label="Known customers"
            value={report.repeatCustomers.knownCustomerCount}
            hint="Email, phone, or account match"
            tone="gray"
          />
          <MetricCard
            label="Repeat customers"
            value={report.repeatCustomers.repeatCustomerCount}
            hint="More than one order"
            tone="green"
          />
          <MetricCard
            label="Repeat orders"
            value={report.repeatCustomers.repeatOrderCount}
            hint="Foundation metric"
            tone="blue"
          />
        </SimpleGrid>

        <Stack gap="sm">
          <Text fw={900}>Top Products</Text>
          <AdminTopProductsTable products={report.topProducts} />
        </Stack>

        <SimpleGrid cols={{ base: 1, xl: 2 }}>
          <AdminStockTable title="Low Stock" rows={report.lowStock} tone="orange" />
          <AdminStockTable title="Expired Stock" rows={report.expiredStock} tone="red" />
        </SimpleGrid>
      </Stack>

      <AdminReportDateRangeModal
        opened={dateRange.opened}
        draft={dateRange.draft}
        onChange={dateRange.setDraft}
        onClose={dateRange.close}
        onApply={dateRange.apply}
        onClear={dateRange.clear}
      />
    </div>
  );
}
