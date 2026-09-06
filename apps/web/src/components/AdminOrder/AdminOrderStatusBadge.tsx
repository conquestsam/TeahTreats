import { Badge } from '@mantine/core';
import { adminOrderStatusLabels, type OrderStatusValue } from '@snacks/shared';

const colorByStatus: Partial<Record<OrderStatusValue, string>> = {
  paid: 'green',
  preparing: 'blue',
  ready_for_pickup: 'teal',
  ready_for_pickup_dispatch: 'teal',
  completed: 'gray',
  cancelled: 'red',
  expired: 'red',
  payment_failed: 'red',
  awaiting_admin_payment_approval: 'yellow',
  payment_pending: 'yellow',
  inventory_reserved: 'violet'
};

export function AdminOrderStatusBadge({ status }: { status: OrderStatusValue }) {
  return (
    <Badge color={colorByStatus[status] ?? 'gray'} variant="light">
      {adminOrderStatusLabels[status] ?? status}
    </Badge>
  );
}
