import { Button, Group, Paper, Table, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { AdminOrderAction, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';
import { AdminOrderStatusBadge } from './AdminOrderStatusBadge';

interface AdminOrderTableProps {
  orders: AdminOrderListItem[];
  onView: (order: AdminOrderListItem) => void;
  onAction: (action: AdminOrderAction, order: AdminOrderListItem) => void;
}

export function AdminOrderTable({ orders, onView, onAction }: AdminOrderTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={980}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <Text fw={700}>{order.customerName}</Text>
                  <Text c="dimmed" size="sm">
                    {order.customerEmail}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <AdminOrderStatusBadge status={order.status} />
                </Table.Td>
                <Table.Td>{order.itemCount}</Table.Td>
                <Table.Td>{formatMoney(order.totalCents, order.currency)}</Table.Td>
                <Table.Td>{new Date(order.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => onView(order)}>
                      View Order
                    </Button>
                    <OrderActionButtons order={order} onAction={onAction} />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

function OrderActionButtons({
  order,
  onAction
}: {
  order: AdminOrderListItem;
  onAction: (action: AdminOrderAction, order: AdminOrderListItem) => void;
}) {
  if (order.status === 'paid') {
    return (
      <Button size="xs" onClick={() => onAction('prepare', order)}>
        Prepare
      </Button>
    );
  }
  if (order.status === 'preparing') {
    return (
      <Button size="xs" onClick={() => onAction('ready', order)}>
        Mark Ready
      </Button>
    );
  }
  if (order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch') {
    return (
      <Button size="xs" onClick={() => onAction('complete', order)}>
        Complete
      </Button>
    );
  }
  if (!['completed', 'cancelled', 'refunded', 'expired'].includes(order.status)) {
    return (
      <Button size="xs" color="red" variant="light" onClick={() => onAction('cancel', order)}>
        Cancel
      </Button>
    );
  }
  return null;
}
