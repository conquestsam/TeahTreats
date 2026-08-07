'use client';

import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import type {
  VendorInventoryRow,
  VendorOrderRow,
  VendorProductRow
} from '@/types/VendorDashboard/vendorDashboardTypes';
import { formatMoney } from '@/lib/formatters/money';

interface VendorRecentListsProps {
  products: VendorProductRow[];
  inventory: VendorInventoryRow[];
  orders: VendorOrderRow[];
}

export function VendorRecentLists({ products, inventory, orders }: VendorRecentListsProps) {
  return (
    <SimpleGrid cols={{ base: 1, lg: 3 }}>
      <VendorPanel title="Products">
        {products.slice(0, 5).map((product) => (
          <Group key={product.id} justify="space-between" wrap="nowrap">
            <div className="min-w-0">
              <Text fw={800} size="sm" truncate>
                {product.name}
              </Text>
              <Text size="xs" c="dimmed">
                {product.category ?? 'No category'} · {product.activeSkuCount}/{product.skuCount} active SKU
              </Text>
            </div>
            <Badge color={product.status === 'active' ? 'green' : 'gray'} variant="light">
              {product.status}
            </Badge>
          </Group>
        ))}
        {products.length === 0 ? <EmptyText label="No products yet." /> : null}
      </VendorPanel>

      <VendorPanel title="Inventory">
        {inventory.slice(0, 5).map((batch) => (
          <Group key={batch.id} justify="space-between" wrap="nowrap">
            <div className="min-w-0">
              <Text fw={800} size="sm" truncate>
                {batch.productName}
              </Text>
              <Text size="xs" c="dimmed">
                {batch.skuName}
              </Text>
            </div>
            <Badge
              color={batch.status === 'in_stock' ? 'green' : batch.status === 'low_stock' ? 'orange' : 'red'}
              variant="light"
            >
              {batch.status === 'expired' ? 'expired' : `${batch.available} left`}
            </Badge>
          </Group>
        ))}
        {inventory.length === 0 ? <EmptyText label="No inventory batches yet." /> : null}
      </VendorPanel>

      <VendorPanel title="Orders">
        {orders.slice(0, 5).map((order) => (
          <Group key={order.id} justify="space-between" wrap="nowrap">
            <div className="min-w-0">
              <Text fw={800} size="sm" truncate>
                {order.customer.name}
              </Text>
              <Text size="xs" c="dimmed">
                {order.itemCount} item · {formatMoney(order.totalCents, order.currency)}
              </Text>
            </div>
            <Badge color="blue" variant="light">
              {order.status.replaceAll('_', ' ')}
            </Badge>
          </Group>
        ))}
        {orders.length === 0 ? <EmptyText label="No orders yet." /> : null}
      </VendorPanel>
    </SimpleGrid>
  );
}

function VendorPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="md" className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Text fw={900}>{title}</Text>
      <Stack gap="sm">{children}</Stack>
    </Stack>
  );
}

function EmptyText({ label }: { label: string }) {
  return (
    <Text size="sm" c="dimmed">
      {label}
    </Text>
  );
}
