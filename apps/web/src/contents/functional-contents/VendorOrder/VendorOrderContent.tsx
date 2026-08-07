'use client';

import { SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { VendorOrderDetailModal } from '@/components/functional-components/VendorOrder/VendorOrderDetailModal';
import { VendorOrderMobileCard } from '@/components/functional-components/VendorOrder/VendorOrderMobileCard';
import { VendorOrderTable } from '@/components/functional-components/VendorOrder/VendorOrderTable';
import { useVendorOrderDetailQuery, useVendorOrderQuery } from '@/hooks/VendorOrder/useVendorOrderQuery';
import type { VendorOrderRow } from '@/types/VendorOrder/vendorOrderTypes';

const terminalStatuses = new Set(['completed', 'cancelled', 'expired', 'refunded']);

export function VendorOrderContent() {
  const [selectedOrder, setSelectedOrder] = useState<VendorOrderRow | null>(null);
  const ordersQuery = useVendorOrderQuery();
  const detailQuery = useVendorOrderDetailQuery(selectedOrder?.id ?? null);
  const orders = ordersQuery.data ?? [];

  return (
    <div className="admin-container pb-24 pt-6 md:pb-10 md:pt-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Vendor Orders</Title>
          <Text c="dimmed">View tenant orders and readiness status.</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 4 }}>
          <MetricCard label="Orders" value={orders.length} hint="Recent tenant orders" tone="green" />
          <MetricCard label="Open" value={orders.filter((order) => !terminalStatuses.has(order.status)).length} hint="Needs attention" tone="blue" />
          <MetricCard label="Ready" value={orders.filter((order) => order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch').length} hint="Awaiting completion" tone="orange" />
          <MetricCard label="Completed" value={orders.filter((order) => order.status === 'completed').length} hint="Closed orders" tone="gray" />
        </SimpleGrid>

        {ordersQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Skeleton h={140} />
            <Skeleton h={140} />
          </SimpleGrid>
        ) : ordersQuery.isError ? (
          <StateCard title="Orders unavailable" description="Check your tenant access and try again." tone="warning" />
        ) : orders.length === 0 ? (
          <StateCard title="No orders yet" description="Orders for this tenant will appear here." />
        ) : (
          <>
            <div className="hidden md:block">
              <VendorOrderTable orders={orders} onView={setSelectedOrder} />
            </div>
            <SimpleGrid cols={{ base: 1, sm: 2 }} className="md:hidden">
              {orders.map((order) => (
                <VendorOrderMobileCard key={order.id} order={order} onView={setSelectedOrder} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>

      <VendorOrderDetailModal
        opened={Boolean(selectedOrder)}
        loading={detailQuery.isLoading}
        order={detailQuery.data}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
