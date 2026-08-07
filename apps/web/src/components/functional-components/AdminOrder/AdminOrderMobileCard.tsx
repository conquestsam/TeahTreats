import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { AdminOrderAction, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';
import { AdminOrderStatusBadge } from './AdminOrderStatusBadge';

export function AdminOrderMobileCard({
  order,
  onView,
  onAction
}: {
  order: AdminOrderListItem;
  onView: (order: AdminOrderListItem) => void;
  onAction: (action: AdminOrderAction, order: AdminOrderListItem) => void;
}) {
  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700}>{order.customerName}</Text>
            <Text c="dimmed" size="sm">
              {formatMoney(order.totalCents, order.currency)} - {order.itemCount} item(s)
            </Text>
          </div>
          <AdminOrderStatusBadge status={order.status} />
        </Group>
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => onView(order)}>
            View
          </Button>
          {order.status === 'paid' ? (
            <Button size="xs" onClick={() => onAction('prepare', order)}>
              Prepare
            </Button>
          ) : null}
          {order.status === 'preparing' ? (
            <Button size="xs" onClick={() => onAction('ready', order)}>
              Ready
            </Button>
          ) : null}
          {order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch' ? (
            <Button size="xs" onClick={() => onAction('complete', order)}>
              Complete
            </Button>
          ) : null}
          {!['completed', 'cancelled', 'refunded', 'expired'].includes(order.status) ? (
            <Button size="xs" color="red" variant="light" onClick={() => onAction('cancel', order)}>
              Cancel
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Paper>
  );
}
