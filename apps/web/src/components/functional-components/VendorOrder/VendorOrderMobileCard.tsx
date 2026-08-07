'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { VendorOrderRow } from '@/types/VendorOrder/vendorOrderTypes';
import { VendorOrderStatusBadge } from './VendorOrderStatusBadge';

interface VendorOrderMobileCardProps {
  order: VendorOrderRow;
  onView: (order: VendorOrderRow) => void;
}

export function VendorOrderMobileCard({ order, onView }: VendorOrderMobileCardProps) {
  return (
    <Stack gap="sm" className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Group justify="space-between" align="flex-start">
        <div className="min-w-0">
          <Text fw={900} truncate>{order.customer.name}</Text>
          <Text size="xs" c="dimmed" truncate>{order.customer.email ?? 'No email'}</Text>
        </div>
        <VendorOrderStatusBadge status={order.status} />
      </Group>
      <Text size="sm" c="dimmed">
        {order.itemCount} item · {formatMoney(order.totalCents, order.currency)}
      </Text>
      <Button variant="light" onClick={() => onView(order)}>
        View Order
      </Button>
    </Stack>
  );
}
