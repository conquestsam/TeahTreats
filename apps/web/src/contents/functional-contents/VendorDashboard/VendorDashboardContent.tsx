'use client';

import { Button, Group, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import type { Route } from 'next';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { VendorRecentLists } from '@/components/functional-components/VendorDashboard/VendorRecentLists';
import {
  useVendorDashboardQuery,
  useVendorInventoryQuery,
  useVendorOrdersQuery,
  useVendorProductsQuery
} from '@/hooks/VendorDashboard/useVendorDashboardQuery';

const vendorProductsHref: Route = '/vendor/products';
const vendorOrdersHref: Route = '/vendor/orders';

export function VendorDashboardContent() {
  const dashboardQuery = useVendorDashboardQuery();
  const productsQuery = useVendorProductsQuery();
  const inventoryQuery = useVendorInventoryQuery();
  const ordersQuery = useVendorOrdersQuery();
  const dashboard = dashboardQuery.data;

  return (
    <div className="admin-container pb-24 pt-6 md:pb-10 md:pt-8">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>{dashboard?.tenant.name ?? 'Vendor Dashboard'}</Title>
            <Text c="dimmed">Track catalog, stock, payment proofs, and open orders for this tenant.</Text>
          </div>
          <Group gap="xs">
            <Button component={Link} href={vendorProductsHref} variant="light">
              Products
            </Button>
            <Button component={Link} href={vendorOrdersHref} variant="subtle">
              Orders
            </Button>
          </Group>
        </Group>

        {dashboardQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <Skeleton h={120} />
            <Skeleton h={120} />
            <Skeleton h={120} />
            <Skeleton h={120} />
          </SimpleGrid>
        ) : dashboardQuery.isError ? (
          <StateCard
            title="Dashboard unavailable"
            description="Check your tenant access or sign in again."
            tone="warning"
          />
        ) : dashboard ? (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 6 }}>
              <MetricCard label="Products" value={dashboard.metrics.productCount} hint="All catalog items" tone="green" />
              <MetricCard
                label="Active"
                value={dashboard.metrics.activeProductCount}
                hint="Visible products"
                tone="blue"
              />
              <MetricCard
                label="Stock"
                value={dashboard.metrics.inventoryAvailableCount}
                hint="Available units"
                tone="gray"
              />
              <MetricCard
                label="Low Stock"
                value={dashboard.metrics.lowStockCount}
                hint="Needs attention"
                tone="orange"
              />
              <MetricCard
                label="Payment Proofs"
                value={dashboard.metrics.pendingManualPaymentCount}
                hint="Waiting review"
                tone="orange"
              />
              <MetricCard
                label="Open Orders"
                value={dashboard.metrics.openOrderCount}
                hint="In progress"
                tone="blue"
              />
            </SimpleGrid>

            <VendorRecentLists
              products={productsQuery.data ?? []}
              inventory={inventoryQuery.data ?? []}
              orders={ordersQuery.data ?? []}
            />
            {productsQuery.isError || inventoryQuery.isError || ordersQuery.isError ? (
              <StateCard
                title="Some vendor data is unavailable"
                description="Refresh after checking your tenant access."
                tone="warning"
              />
            ) : null}
          </>
        ) : null}
      </Stack>
    </div>
  );
}
