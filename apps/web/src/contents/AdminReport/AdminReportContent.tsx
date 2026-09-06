'use client';

import { Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { permissions } from '@snacks/shared';
import type { AdminReportsDashboardSummary } from '@snacks/shared';
import { AdminReportBarList } from '@/components/AdminReport/AdminReportBarList';
import { AdminReportDateRangeModal } from '@/components/AdminReport/AdminReportDateRangeModal';
import {
  AdminStockTable,
  AdminTopProductsTable,
  formatMoney
} from '@/components/AdminReport/AdminReportTables';
import { AppPageHeader } from '@/components/ui/app-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { useAdminCurrentUserQuery } from '@/hooks/AdminAuth/useAdminAuthQuery';
import { useAdminReportDateRange } from '@/hooks/AdminReport/useAdminReportDateRange';
import { useAdminReportDashboardQuery } from '@/hooks/AdminReport/useAdminReportQuery';

export function AdminReportContent() {
  const dateRange = useAdminReportDateRange();
  const currentUserQuery = useAdminCurrentUserQuery();
  const canViewAllTenants = currentUserQuery.data?.permissions.includes(permissions.tenantsManage) ?? false;
  const reportsQuery = useAdminReportDashboardQuery(dateRange.range, canViewAllTenants ? 'all' : undefined, currentUserQuery.isSuccess);
  const report = reportsQuery.data;
  const [selectedRevenueIndex, setSelectedRevenueIndex] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
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
          description={reportsQuery.error instanceof Error ? reportsQuery.error.message : 'Please check your access and try again.'}
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
  const activeRevenueIndex = selectedRevenueIndex ?? Math.max(0, revenueItems.length - 1);
  const selectedRevenue = revenueItems[activeRevenueIndex] ?? null;
  const statusItems = report.ordersByStatus.map((item) => ({
    label: item.status.replaceAll('_', ' '),
    value: item.count
  }));
  const totalStatusCount = Math.max(1, report.ordersByStatus.reduce((sum, item) => sum + item.count, 0));
  const repeatRate = percent(report.repeatCustomers.repeatCustomerCount, report.repeatCustomers.knownCustomerCount);
  const filteredStatusCount = selectedStatus ? report.ordersByStatus.find((item) => item.status === selectedStatus)?.count ?? 0 : totalStatusCount;

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <section className="admin-mobile-workflow-header">
          <div className="admin-mobile-brand-row">
            <div>
              <Text fw={950} className="admin-mobile-brand-title">TeshTreats <span>Reports</span></Text>
              <Text className="admin-mobile-live-dot">Live reports</Text>
            </div>
            <span className="admin-mobile-avatar">A</span>
          </div>
          <Title order={1} className="admin-mobile-page-title">Reports & Analytics</Title>
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Sales, payments, stock, and customer activity.</Text>
        </section>

        <div className="admin-desktop-page-header">
          <AppPageHeader
            eyebrow="Reports & Insights"
            title="Reports & Analytics"
            description="Sales, payment, stock, and customer activity across the selected period."
            badge={rangeLabel}
          />
        </div>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Showing {rangeLabel.toLowerCase()}.
          </Text>
          <Group gap="xs">
            <Button variant="secondary" onClick={dateRange.open}>Change Date Range</Button>
            <Button variant="secondary" onClick={() => downloadReportCsv(report, rangeLabel)}>Download CSV</Button>
            <Button variant="default" onClick={() => exportReportPdf(report, rangeLabel)}>Export PDF</Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics">
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
            label="Discount given"
            value={formatMoney(summary.discountCents, summary.currency)}
            hint="Customer savings"
            tone="orange"
          />
          <MetricCard
            label="Manual payments"
            value={report.manualPaymentPendingCount}
            hint="Waiting for review"
            tone={report.manualPaymentPendingCount > 0 ? 'orange' : 'gray'}
          />
        </SimpleGrid>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <ReportLinePanel
            title="Revenue Velocity"
            subtitle="Daily captured revenue"
            items={revenueItems}
            currency={summary.currency}
            selectedIndex={activeRevenueIndex}
            onSelect={setSelectedRevenueIndex}
          />
          <ReportStatusRing
            statuses={report.ordersByStatus}
            total={totalStatusCount}
            selectedStatus={selectedStatus}
            onSelect={setSelectedStatus}
          />
        </div>

        <Card className="border-[#3a3034] bg-[#1f1d23]">
          <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#ffd98a]">Selected View</p>
              <p className="mt-1 text-base font-black text-[#fff7e8]">
                {selectedRevenue ? `${selectedRevenue.label}: ${formatMoney(selectedRevenue.value, summary.currency)}` : 'No revenue yet'}
              </p>
              <p className="text-sm text-[#bca6a7]">{selectedRevenue?.hint ?? 'Choose a point on the chart to inspect a day.'}</p>
            </div>
            <Badge variant="default">
              {selectedStatus ? `${selectedStatus.replaceAll('_', ' ')}: ${filteredStatusCount}` : `${filteredStatusCount} orders`}
            </Badge>
          </CardContent>
        </Card>

        <SimpleGrid cols={{ base: 1, lg: 2 }} className="hidden md:grid">
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
            label="Repeat rate"
            value={`${repeatRate}%`}
            hint="Customers who came back"
            tone="green"
          />
          <MetricCard
            label="Repeat orders"
            value={report.repeatCustomers.repeatOrderCount}
            hint="Foundation metric"
            tone="blue"
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <ReportTopProductsPanel products={report.topProducts} currency={summary.currency} />
          <ReportPromotionPanel discountCents={summary.discountCents} revenueCents={summary.netRevenueCents} currency={summary.currency} />
        </SimpleGrid>

        <div className="hidden md:block">
          <Stack gap="sm">
            <Text fw={900}>Top Products</Text>
            <AdminTopProductsTable products={report.topProducts} />
          </Stack>
        </div>

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

function ReportLinePanel({
  title,
  subtitle,
  items,
  currency,
  selectedIndex,
  onSelect
}: {
  title: string;
  subtitle: string;
  items: Array<{ label: string; value: number; hint?: string }>;
  currency: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const chartPoints = items.map((item, index) => {
    const x = items.length <= 1 ? 0 : (index / (items.length - 1)) * 100;
    const y = 92 - (item.value / max) * 72;
    return { item, index, x, y };
  });
  const points = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const peak = items.reduce((best, item) => (item.value > best.value ? item : best), items[0] ?? { label: 'Now', value: 0 });
  const chartLabels = items.length ? [items[0], peak, items[items.length - 1]].filter((item): item is { label: string; value: number; hint?: string } => Boolean(item)) : [];

  const areaPoints = points ? `0,100 ${points} 100,100` : '';
  const targetPoints = chartPoints.map((point, index) => {
    const x = point.x;
    const y = 86 - (index / Math.max(1, chartPoints.length - 1)) * 36;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className="border-[#312b31] bg-[#1f1d23] shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-[#bca6a7]">{subtitle}</p>
        </div>
        <Badge variant="default">Peak {formatMoney(peak.value, currency)}</Badge>
      </CardHeader>
      <CardContent>
        <div className="relative h-[230px] overflow-hidden rounded-lg border border-[#2e2930] bg-[#151319] p-3">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(240,198,109,0.14),transparent_58%),repeating-linear-gradient(to_bottom,transparent_0_46px,rgba(255,255,255,0.06)_47px)]" />
          <svg className="relative h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Revenue trend">
            <polygon points={areaPoints} fill="rgba(240,198,109,0.2)" />
            <polyline points={targetPoints} fill="none" stroke="#e8304d" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <polyline points={points} fill="none" stroke="rgba(240,198,109,0.22)" strokeWidth="12" vectorEffect="non-scaling-stroke" />
            <polyline points={points} fill="none" stroke="#f0c66d" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            {chartPoints.map((point) => (
              <circle
                key={`${point.item.label}-${point.index}`}
                cx={point.x}
                cy={point.y}
                r={point.index === selectedIndex ? 3.8 : 2.5}
                fill={point.index === selectedIndex ? '#fff4cf' : '#f0c66d'}
                stroke="#0b0b0b"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => onSelect(point.index)}
                onClick={() => onSelect(point.index)}
              />
            ))}
          </svg>
          {chartPoints[selectedIndex] ? (
            <div
              className="pointer-events-none absolute rounded-md bg-[#2c2730] px-2 py-1 text-[11px] font-black text-[#ffd98a] shadow-lg"
              style={{
                left: `${Math.min(78, Math.max(4, chartPoints[selectedIndex].x))}%`,
                top: `${Math.min(78, Math.max(8, chartPoints[selectedIndex].y))}%`
              }}
            >
              {chartPoints[selectedIndex].item.label}: {formatMoney(chartPoints[selectedIndex].item.value, currency)}
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex justify-between text-xs font-extrabold text-[#8f7b7d]">
          {chartLabels.map((item) => (
            <span key={`${item.label}-${item.value}`}>{item.label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportStatusRing({
  statuses,
  total,
  selectedStatus,
  onSelect
}: {
  statuses: Array<{ status: string; count: number }>;
  total: number;
  selectedStatus: string | null;
  onSelect: (status: string | null) => void;
}) {
  const completed = statuses.find((item) => item.status === 'completed')?.count ?? 0;
  const selectedCount = selectedStatus ? statuses.find((item) => item.status === selectedStatus)?.count ?? 0 : completed;
  const selectedPercent = Math.round((selectedCount / total) * 100);
  const ringStyle = {
    background: `conic-gradient(#f0c66d 0 ${selectedPercent}%, #e8304d ${selectedPercent}% ${Math.min(100, selectedPercent + 20)}%, #302a31 ${Math.min(100, selectedPercent + 20)}% 100%)`
  } satisfies CSSProperties;

  return (
    <Card className="border-[#312b31] bg-[#1f1d23] shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle>Execution Pipeline</CardTitle>
          <p className="mt-1 text-sm text-[#bca6a7]">Orders by current status</p>
        </div>
        <Badge variant="default">{total} orders</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid items-center gap-5 sm:grid-cols-[160px_1fr]">
          <button
            type="button"
            className="relative mx-auto grid h-36 w-36 place-items-center rounded-full transition-transform hover:scale-[1.02]"
            onClick={() => onSelect(null)}
            style={ringStyle}
            aria-label="Show all order statuses"
          >
            <span className="absolute inset-5 rounded-full bg-[#1f1d23] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
            <span className="relative text-center">
              <strong className="block text-2xl font-black text-[#fff7e8]">{selectedPercent}%</strong>
              <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#d9aeb3]">
                {selectedStatus ? selectedStatus.replaceAll('_', ' ') : 'Complete'}
              </span>
            </span>
          </button>
          <div className="space-y-2">
          {statuses.slice(0, 5).map((item) => (
            <button
              type="button"
              key={item.status}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                selectedStatus === item.status
                  ? 'border-[#f0c66d] bg-[#473919] text-[#fff7e8]'
                  : 'border-[#332d34] bg-[#19171d] text-[#d8cacc] hover:border-[#f0c66d]/50'
              }`}
              onClick={() => onSelect(selectedStatus === item.status ? null : item.status)}
            >
              <span className="capitalize">{item.status.replaceAll('_', ' ')}</span>
              <span className="font-black text-[#ffd98a]">{item.count}</span>
            </button>
          ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportTopProductsPanel({ products, currency }: { products: Array<{ productName: string; skuName: string; quantitySold: number; revenueCents: number }>; currency: string }) {
  const max = Math.max(1, ...products.map((product) => product.revenueCents));
  return (
    <Card className="border-[#312b31] bg-[#1f1d23]">
      <CardHeader className="pb-2">
        <CardTitle>Top Products</CardTitle>
        <p className="text-sm text-[#bca6a7]">Ranked by revenue</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.slice(0, 5).map((product, index) => (
          <div key={`${product.productName}-${product.skuName}`} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg bg-[#19171d] p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#fff7e8]">{product.productName}</p>
              <p className="text-xs text-[#bca6a7]">{product.quantitySold} units sold</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#332d34]">
                <span
                  className="block h-full rounded-full bg-[#f0c66d]"
                  style={{ width: `${Math.max(8, (product.revenueCents / max) * 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-[#ffd98a]">{formatMoney(product.revenueCents, currency)}</p>
              <p className="text-xs font-bold text-[#8f7b7d]">Rank #{index + 1}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReportPromotionPanel({ discountCents, revenueCents, currency }: { discountCents: number; revenueCents: number; currency: string }) {
  const lift = revenueCents > 0 ? Math.round((discountCents / revenueCents) * 100) : 0;
  return (
    <Card className="border-[#312b31] bg-[#1f1d23]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle>Discount Impact</CardTitle>
          <p className="mt-1 text-sm text-[#bca6a7]">Discount value compared with sales</p>
        </div>
        <Badge variant="default">Live data</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
      <div className="rounded-lg bg-[#5a4216] p-4 text-[#fff7e8]">
        <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#ffd98a]">Total discount given</p>
        <p className="mt-1 text-3xl font-black">{formatMoney(discountCents, currency)}</p>
        <p className="text-sm font-bold text-[#f6d58c]">{lift}% of net revenue</p>
      </div>
      <p className="text-sm text-[#bca6a7]">Use this to see how much discount was given during the selected period.</p>
      </CardContent>
    </Card>
  );
}

function percent(value: number, total: number) {
  return total <= 0 ? 0 : Math.round((value / total) * 100);
}

function downloadReportCsv(report: AdminReportsDashboardSummary, label: string) {
  const lines = [
    ['Report', label],
    ['Net revenue', report.salesSummary.netRevenueCents / 100],
    ['Orders', report.salesSummary.orderCount],
    ['Manual payments waiting', report.manualPaymentPendingCount],
    [],
    ['Top products'],
    ['Product', 'Option', 'Sold', 'Revenue USD'],
    ...report.topProducts.map((item) => [item.productName, item.skuName, item.quantitySold, item.revenueCents / 100])
  ];
  const csv = lines.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `teshtreats-report-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportReportPdf(report: AdminReportsDashboardSummary, label: string) {
  const currency = report.salesSummary.currency;
  const topRows = report.topProducts
    .slice(0, 10)
    .map((item) => `<tr><td>${escapeHtml(item.productName)}</td><td>${escapeHtml(item.skuName)}</td><td>${item.quantitySold}</td><td>${formatMoney(item.revenueCents, currency)}</td></tr>`)
    .join('');
  const statusRows = report.ordersByStatus
    .map((item) => `<tr><td>${escapeHtml(item.status.replaceAll('_', ' '))}</td><td>${item.count}</td></tr>`)
    .join('');
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>TeshTreats Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #181818; padding: 32px; }
    h1 { margin: 0 0 4px; font-size: 28px; }
    h2 { margin-top: 28px; font-size: 18px; }
    .muted { color: #666; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; }
    .value { font-size: 22px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f6f3ee; }
  </style>
</head>
<body>
  <h1>TeshTreats Reports & Analytics</h1>
  <div class="muted">${escapeHtml(label)}</div>
  <div class="grid">
    <div class="card"><div class="muted">Net revenue</div><div class="value">${formatMoney(report.salesSummary.netRevenueCents, currency)}</div></div>
    <div class="card"><div class="muted">Average order</div><div class="value">${formatMoney(report.salesSummary.averageOrderValueCents, currency)}</div></div>
    <div class="card"><div class="muted">Discount given</div><div class="value">${formatMoney(report.salesSummary.discountCents, currency)}</div></div>
    <div class="card"><div class="muted">Manual payments waiting</div><div class="value">${report.manualPaymentPendingCount}</div></div>
  </div>
  <h2>Orders by Status</h2>
  <table><thead><tr><th>Status</th><th>Orders</th></tr></thead><tbody>${statusRows}</tbody></table>
  <h2>Top Products</h2>
  <table><thead><tr><th>Product</th><th>Option</th><th>Sold</th><th>Revenue</th></tr></thead><tbody>${topRows}</tbody></table>
</body>
</html>`;
  const reportWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!reportWindow) return;
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char] ?? char);
}
