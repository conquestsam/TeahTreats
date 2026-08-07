import { Button, Group, Modal, Stack, Table, Text, Textarea } from '@mantine/core';
import { adminOrderStatusLabels } from '@snacks/shared';
import { formatMoney } from '@/lib/formatters/money';
import type { useAdminOrderCancelForm } from '@/hooks/AdminOrder/useAdminOrderForm';
import type { AdminOrderAction, AdminOrderDetail, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';
import { AdminOrderStatusBadge } from './AdminOrderStatusBadge';

export function AdminOrderDetailModal({
  opened,
  order,
  loading,
  onClose
}: {
  opened: boolean;
  order: AdminOrderDetail | undefined;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Order Details" size="lg" centered>
      {loading || !order ? (
        <Text c="dimmed">Loading order...</Text>
      ) : (
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text fw={700}>{order.customer.name}</Text>
              <Text size="sm" c="dimmed">
                {order.customer.email} - {order.customer.phone}
              </Text>
            </div>
            <AdminOrderStatusBadge status={order.status} />
          </Group>
          <Text size="sm">{order.customer.address}</Text>
          {(order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch') ? (
            <Text size="sm" c="teal" fw={700}>
              Customer readiness notification has been queued.
            </Text>
          ) : null}
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {order.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text fw={600}>{item.productName}</Text>
                    <Text size="xs" c="dimmed">
                      {item.skuName}
                    </Text>
                  </Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>{formatMoney(item.lineTotalCents, order.currency)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Text fw={700}>Total: {formatMoney(order.totalCents, order.currency)}</Text>
          <Stack gap={4}>
            <Text fw={700}>History</Text>
            {order.history.map((item) => (
              <Text key={item.id} size="sm" c="dimmed">
                {adminOrderStatusLabels[item.status] ?? item.status} - {item.reason ?? 'No note'}
              </Text>
            ))}
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}

export function AdminOrderConfirmModal({
  opened,
  action,
  order,
  loading,
  onClose,
  onConfirm
}: {
  opened: boolean;
  action: Exclude<AdminOrderAction, 'cancel'>;
  order: AdminOrderListItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={actionTitle(action)} centered>
      <Stack gap="md">
        <Text size="sm">
          {actionMessage(action, order?.customerName ?? 'this customer')}
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Keep Order
          </Button>
          <Button loading={loading} onClick={onConfirm}>
            Confirm
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function AdminOrderCancelModal({
  opened,
  form,
  loading,
  onClose,
  onSubmit
}: {
  opened: boolean;
  form: ReturnType<typeof useAdminOrderCancelForm>;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Cancel Order" centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Textarea
            label="Reason"
            placeholder="Add a short reason."
            autosize
            minRows={3}
            {...form.getInputProps('reason')}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Keep Order
            </Button>
            <Button color="red" type="submit" loading={loading}>
              Cancel Order
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function actionTitle(action: Exclude<AdminOrderAction, 'cancel'>) {
  if (action === 'prepare') {
    return 'Prepare Order';
  }
  if (action === 'ready') {
    return 'Mark Order Ready';
  }
  return 'Complete Order';
}

function actionMessage(action: Exclude<AdminOrderAction, 'cancel'>, customerName: string) {
  if (action === 'prepare') {
    return `Start preparing ${customerName}'s order?`;
  }
  if (action === 'ready') {
    return `Mark ${customerName}'s order ready and notify the customer?`;
  }
  return `Mark ${customerName}'s order completed?`;
}
