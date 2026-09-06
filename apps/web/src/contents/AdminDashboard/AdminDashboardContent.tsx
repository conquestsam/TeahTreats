'use client';

import { Badge, Button, Group, Paper, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { permissions, type OrdersByStatusReportItem, type StockReportItem, type TopProductReportItem } from '@snacks/shared';

import { AdminReportBarList } from '@/components/AdminReport/AdminReportBarList';
import { formatMoney } from '@/components/AdminReport/AdminReportTables';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppForbiddenState } from '@/components/ui/AppForbiddenState';
import { AppLoadingState } from '@/components/ui/AppLoadingState';
import { ApiUnavailableState } from '@/components/ui/ApiUnavailableState';
import { useAdminCurrentUserQuery } from '@/hooks/AdminAuth/useAdminAuthQuery';
import { useAdminReportDashboardQuery } from '@/hooks/AdminReport/useAdminReportQuery';

function DashboardCard({
  children,
  className = '',
  p = 'lg'
}: {
  children: React.ReactNode;
  className?: string;
  p?: 'md' | 'lg';
}) {
  return (
    <Paper
      withBorder
      className={`admin-ops-card ${className}`}
      p={p}
      styles={{
        root: {
          background: '#111111',
          borderColor: 'rgba(255,255,255,0.09)',
          borderRadius: 10,
          color: 'var(--tt-cream)'
        }
      }}
    >
      {children}
    </Paper>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
  tone = 'gold'
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: React.ReactNode;
  tone?: 'gold' | 'green' | 'pink' | 'red';
}) {
  const color = {
    gold: 'var(--tt-gold-light)',
    green: '#31e981',
    pink: '#ff9caf',
    red: '#ff7a8c'
  }[tone];

  return (
    <DashboardCard>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Text size="sm" fw={700} style={{ color: 'var(--tt-cream-dim)' }}>
          {label}
        </Text>
        <span style={{ color, display: 'inline-flex' }}>{icon}</span>
      </Group>
      <Title order={2} style={{ color: 'var(--tt-cream)', fontFamily: 'var(--tt-font-sans)', fontSize: 'clamp(1.7rem, 4vw, 2.3rem)' }}>
        {value}
      </Title>
      <Text mt={6} size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
        {detail}
      </Text>
    </DashboardCard>
  );
}

function formatStatus(status: string) {
  return status.replaceAll('_', ' ');
}

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function StockRiskList({ lowStock, expiredStock }: { lowStock: StockReportItem[]; expiredStock: StockReportItem[] }) {
  const risks = [
    ...expiredStock.map((item) => ({ ...item, risk: 'Expired', tone: 'red' as const })),
    ...lowStock.map((item) => ({ ...item, risk: 'Low stock', tone: 'yellow' as const }))
  ].slice(0, 5);

  return (
    <DashboardCard>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <div>
          <Text fw={900} tt="uppercase">Inventory Health</Text>
          <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>Items that need stock attention</Text>
        </div>
        <Text size="sm" fw={900} style={{ color: risks.length > 0 ? '#ff9caf' : '#31e981' }}>
          {risks.length > 0 ? `${risks.length} flagged` : 'Clear'}
        </Text>
      </Group>

      <Stack gap="sm">
        {risks.length === 0 ? (
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
            Stock looks healthy for this view.
          </Text>
        ) : risks.map((item) => (
          <Paper key={`${item.batchId}-${item.risk}`} p="sm" withBorder styles={{ root: { background: '#151515', borderColor: 'rgba(255,255,255,0.08)' } }}>
            <Group justify="space-between" gap="sm" wrap="nowrap">
              <div>
                <Text fw={800}>{item.productName}</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>{item.skuName}</Text>
              </div>
              <Stack gap={2} align="end">
                <Badge color={item.tone} variant="light">{item.risk}</Badge>
                <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>{item.available} available</Text>
              </Stack>
            </Group>
          </Paper>
        ))}
      </Stack>
    </DashboardCard>
  );
}

function OrdersByStatusPanel({ statuses, totalOrders }: { statuses: OrdersByStatusReportItem[]; totalOrders: number }) {
  return (
    <DashboardCard>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <div>
          <Title order={2} size="h3" style={{ fontFamily: 'var(--tt-font-sans)' }}>
            Orders by Status
          </Title>
          <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
            Current order totals for the selected period.
          </Text>
        </div>
        <Badge variant="light" color="yellow">{totalOrders} total</Badge>
      </Group>

      <Stack gap="md">
        {statuses.length === 0 ? (
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
            No orders returned for this date range.
          </Text>
        ) : statuses.map((item) => (
          <div key={item.status}>
            <Group justify="space-between" mb={6}>
              <Text size="sm" fw={800} tt="capitalize">{formatStatus(item.status)}</Text>
              <Text size="sm" fw={900} style={{ color: 'var(--tt-gold-light)' }}>{item.count}</Text>
            </Group>
            <Progress value={percent(item.count, totalOrders)} color="yellow" radius="xl" />
          </div>
        ))}
      </Stack>
    </DashboardCard>
  );
}

function TopProductsPanel({ products, currency }: { products: TopProductReportItem[]; currency: string }) {
  return (
    <DashboardCard>
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <div>
          <Title order={2} size="h3" style={{ fontFamily: 'var(--tt-font-sans)' }}>
            Top Products
          </Title>
          <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
            Ranked by paid/completed order items.
          </Text>
        </div>
        <span style={{ color: 'var(--tt-gold-light)', fontWeight: 900 }}>↗</span>
      </Group>

      <Stack gap="sm">
        {products.length === 0 ? (
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
            No product sales returned for this range yet.
          </Text>
        ) : products.slice(0, 6).map((product, index) => (
          <Group key={`${product.productName}-${product.skuName}`} justify="space-between" gap="md" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(184,147,62,0.12)] text-xs font-black text-[var(--tt-gold-light)]">
                {index + 1}
              </span>
              <div>
                <Text fw={800} lineClamp={1}>{product.productName}</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>{product.skuName} · {product.quantitySold} sold</Text>
              </div>
            </Group>
            <Text fw={900} style={{ color: 'var(--tt-cream)' }}>{formatMoney(product.revenueCents, currency)}</Text>
          </Group>
        ))}
      </Stack>
    </DashboardCard>
  );
}

export function AdminDashboardContent() {
  const currentUserQuery = useAdminCurrentUserQuery();
  const canViewReports = currentUserQuery.data?.permissions.includes(permissions.dashboardRead) ?? false;
  const canViewAllTenants = currentUserQuery.data?.permissions.includes(permissions.tenantsManage) ?? false;
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);

  const dashboardQuery = useAdminReportDashboardQuery(
    {
      from: from.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10)
    },
    canViewAllTenants ? 'all' : undefined,
    currentUserQuery.isSuccess
  );

  if (currentUserQuery.isLoading || dashboardQuery.isLoading) {
    return <AppLoadingState message="Syncing bakehouse metrics" scope="panel" variant="admin" />;
  }

  if (currentUserQuery.isSuccess && !canViewReports) {
    return (
      <div className="admin-container py-8">
        <AppForbiddenState
          title="Dashboard permission required"
          description="You do not have permission for this action."
          variant="admin"
        />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="admin-container py-8">
        <ApiUnavailableState
          onRetry={() => void dashboardQuery.refetch()}
          serviceLabel="Dashboard"
          variant="admin"
        />
      </div>
    );
  }

  const report = dashboardQuery.data;

  if (!report) {
    return (
      <div className="admin-container py-8">
        <AppEmptyState
          title="No dashboard data returned"
          description="No dashboard information is available right now. Please refresh or try again shortly."
        />
      </div>
    );
  }

  const summary = report.salesSummary;
  const totalOrdersByStatus = report.ordersByStatus.reduce((sum, item) => sum + item.count, 0);
  const paidRate = percent(summary.paidOrderCount, summary.orderCount);
  const stockRiskCount = report.lowStock.length + report.expiredStock.length;
  const repeatRate = percent(report.repeatCustomers.repeatCustomerCount, report.repeatCustomers.knownCustomerCount);
  const revenueItems = report.revenueByDay.slice(-14).map((item) => ({
    label: new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: item.revenueCents,
    hint: `${item.orderCount} orders`
  }));
  const scopeLabel = canViewAllTenants ? 'All Stores' : 'Assigned Store';

  return (
    <div className="admin-container py-8">
      <Stack gap="xl">
        <Group justify="space-between" align="end" gap="md">
          <Stack gap={4}>
            <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
              {scopeLabel} <span style={{ color: 'var(--tt-cream-muted)' }}>/ Last 30 days</span>
            </Text>
            <Title order={1} style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1 }}>
              {canViewAllTenants ? 'Executive Overview' : 'Operations Overview'}
            </Title>
          </Stack>
          <Group gap="sm">
            <Button variant="default" styles={{ root: { background: '#1b1b1b', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--tt-cream)' } }}>
              {scopeLabel}
            </Button>
            <Button leftSection={<span aria-hidden="true">↓</span>} variant="default" className="hidden sm:inline-flex" styles={{ root: { background: '#111', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--tt-cream-muted)' } }}>
              Export later
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
          <Metric
            icon={<span aria-hidden="true">₦</span>}
            label="Net Revenue"
            value={formatMoney(summary.netRevenueCents, summary.currency)}
            tone="green"
            detail={`${summary.paidOrderCount} paid orders · ${formatMoney(summary.averageOrderValueCents, summary.currency)} average`}
          />
          <Metric
            icon={<span aria-hidden="true">□</span>}
            label="Total Orders"
            value={`${summary.orderCount}`}
            detail={`${paidRate}% paid/completed revenue rate`}
          />
          <Metric
            icon={<span aria-hidden="true">▤</span>}
            label="Manual Payments"
            value={`${report.manualPaymentPendingCount}`}
            tone={report.manualPaymentPendingCount > 0 ? 'pink' : 'green'}
            detail={report.manualPaymentPendingCount > 0 ? 'Proofs waiting for admin review' : 'No manual payment review pending'}
          />
          <Metric
            icon={<span aria-hidden="true">!</span>}
            label="Inventory Risk"
            value={`${stockRiskCount}`}
            tone={stockRiskCount > 0 ? 'red' : 'green'}
            detail={`${report.lowStock.length} low stock · ${report.expiredStock.length} expired`}
          />
        </SimpleGrid>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              <OrdersByStatusPanel statuses={report.ordersByStatus} totalOrders={totalOrdersByStatus} />
              <AdminReportBarList
                title="Revenue by Day"
                items={revenueItems}
                valueLabel={(value) => formatMoney(value, summary.currency)}
              />
            </SimpleGrid>

            <TopProductsPanel products={report.topProducts} currency={summary.currency} />
          </Stack>

          <Stack gap="lg">
            <DashboardCard>
              <Group justify="space-between" mb="lg" wrap="nowrap">
                <div>
                  <Text fw={900} tt="uppercase">Action Required</Text>
                  <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>Work that needs attention today.</Text>
                </div>
                <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>{stockRiskCount + report.manualPaymentPendingCount} items</Text>
              </Group>
              <Stack gap="sm">
                {report.manualPaymentPendingCount > 0 ? (
                  <Paper p="md" withBorder styles={{ root: { background: 'rgba(184,147,62,0.06)', borderColor: 'rgba(184,147,62,0.28)' } }}>
                    <Text fw={850}>Review manual payment proofs</Text>
                    <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
                      {report.manualPaymentPendingCount} payment {report.manualPaymentPendingCount === 1 ? 'record needs' : 'records need'} approval.
                    </Text>
                  </Paper>
                ) : null}
                {stockRiskCount > 0 ? (
                  <Paper p="md" withBorder styles={{ root: { background: '#151515', borderColor: 'rgba(255,255,255,0.08)' } }}>
                    <Text fw={850}>Resolve stock exceptions</Text>
                    <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
                      {report.lowStock.length} low-stock and {report.expiredStock.length} expired batches returned.
                    </Text>
                  </Paper>
                ) : null}
                {stockRiskCount + report.manualPaymentPendingCount === 0 ? (
                  <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
                    Nothing requires immediate review right now.
                  </Text>
                ) : null}
              </Stack>
            </DashboardCard>

            <StockRiskList lowStock={report.lowStock} expiredStock={report.expiredStock} />

            <DashboardCard>
              <Group justify="space-between" mb="md">
                <div>
                  <Text fw={900} tt="uppercase">Customer Repeat Signal</Text>
                  <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>Customers who came back to order again.</Text>
                </div>
                <span style={{ color: 'var(--tt-gold-light)', fontWeight: 900 }}>✓</span>
              </Group>
              <Group justify="space-between" mb={6}>
                <Text size="sm" fw={800}>Repeat customer rate</Text>
                <Text size="sm" fw={900} style={{ color: repeatRate > 0 ? '#31e981' : 'var(--tt-cream-muted)' }}>{repeatRate}%</Text>
              </Group>
              <Progress value={repeatRate} color="green" radius="xl" />
              <SimpleGrid cols={3} mt="md">
                <div>
                  <Text fw={900}>{report.repeatCustomers.knownCustomerCount}</Text>
                  <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>Known</Text>
                </div>
                <div>
                  <Text fw={900}>{report.repeatCustomers.repeatCustomerCount}</Text>
                  <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>Repeat</Text>
                </div>
                <div>
                  <Text fw={900}>{report.repeatCustomers.repeatOrderCount}</Text>
                  <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>Orders</Text>
                </div>
              </SimpleGrid>
            </DashboardCard>

            <DashboardCard>
              <Group gap="sm" wrap="nowrap">
                <span style={{ color: 'var(--tt-cream-muted)', fontWeight: 900 }}>◷</span>
                <div>
                  <Text fw={900}>More live operations coming soon</Text>
                  <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>
                    Kitchen speed and prep-time views will appear here once those tools are ready.
                  </Text>
                </div>
              </Group>
            </DashboardCard>
          </Stack>
        </div>
      </Stack>
    </div>
  );
}
