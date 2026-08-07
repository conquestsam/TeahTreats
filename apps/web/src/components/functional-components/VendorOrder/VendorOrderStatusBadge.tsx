'use client';

import { Badge } from '@mantine/core';
import type { OrderStatusValue } from '@snacks/shared';

export function VendorOrderStatusBadge({ status }: { status: OrderStatusValue }) {
  const color = ['completed', 'paid', 'ready_for_pickup', 'ready_for_pickup_dispatch'].includes(status)
    ? 'green'
    : ['cancelled', 'expired', 'refunded', 'payment_failed'].includes(status)
      ? 'red'
      : 'blue';
  return (
    <Badge color={color} variant="light">
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}
