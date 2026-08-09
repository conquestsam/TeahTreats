'use client';

import { Badge, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { formatMoney } from '@/components/functional-components/AdminReport/AdminReportTables';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { useAdminReportDashboardQuery } from '@/hooks/AdminReport/useAdminReportQuery';

export function OperationsCenter() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);
  const dashboardQuery = useAdminReportDashboardQuery({
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10)
  });
  const report = dashboardQuery.data;
  const summary = report?.salesSummary;
  const readyOrders = report?.ordersByStatus.find((item) => item.status === 'ready_for_pickup')?.count ?? 0;

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <Paper withBorder p="lg" className="enterprise-panel">
          <Group justify="space-between" align="start">
            <div>
              <Text size="xs" fw={700} tt="uppercase" c="green.7" lts={0.8}>
                Command center
              </Text>
              <Title order={1} className="text-2xl md:text-4xl">Operations Center</Title>
              <Text c="dimmed" size="sm" maw={560}>Sales, payment proofs, stock warnings, and readiness work for the current tenant.</Text>
            </div>
            <Badge color="green" variant="dot" size="sm">
              Live-ready
            </Badge>
          </Group>
        </Paper>
        {dashboardQuery.isLoading ? (
          <StateCard loading title="Loading dashboard..." description="Building the latest tenant summary." />
        ) : dashboardQuery.isError ? (
          <StateCard
            title="Dashboard unavailable."
            description={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Check your session, tenant header, and reports permission.'}
            tone="warning"
          />
        ) : !report || !summary ? (
          <StateCard title="Dashboard unavailable." description="No report data was returned for this tenant." tone="warning" />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <MetricCard
              label="Paid orders"
              value={summary.paidOrderCount}
              tone="green"
              hint={`${formatMoney(summary.netRevenueCents, summary.currency)} net revenue`}
            />
            <MetricCard
              label="Manual proofs"
              value={report.manualPaymentPendingCount}
              tone={report.manualPaymentPendingCount > 0 ? 'orange' : 'gray'}
              hint="Waiting for review"
            />
            <MetricCard
              label="Low stock alerts"
              value={report.lowStock.length}
              tone={report.lowStock.length > 0 ? 'red' : 'gray'}
              hint="Expiry-aware batches"
            />
            <MetricCard
              label="Ready orders"
              value={readyOrders}
              tone={readyOrders > 0 ? 'blue' : 'gray'}
              hint="Ready for customer completion"
            />
          </SimpleGrid>
        )}
        <SimpleGrid cols={{ base: 1, lg: 3 }}>
          {[
            ['Order readiness', 'Notify customers through email, SMS, WhatsApp placeholders, and SSE updates.'],
            ['Manual proof review', 'Receipts are queued for admin review without rolling back payment state.'],
            ['Inventory watch', 'Expiry-aware batches keep perishable snacks from being oversold.']
          ].map(([title, text]) => (
            <Paper key={title} withBorder p="lg" className="enterprise-panel" styles={{ root: { borderColor: 'rgba(0,0,0,0.06)' } }}>
              <Stack gap="xs">
                <Title order={3} size="h5">{title}</Title>
                <Text c="dimmed" size="sm">{text}</Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </div>
  );
}
