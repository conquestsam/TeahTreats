import { Badge, Button, Divider, Group, Modal, Paper, ScrollArea, SimpleGrid, Stack, Table, Text, Textarea } from '@mantine/core';
import { adminOrderStatusLabels } from '@snacks/shared';
import { formatMoney } from '@/lib/formatters/money';
import type { useAdminOrderCancelForm } from '@/hooks/AdminOrder/useAdminOrderForm';
import type { AdminOrderAction, AdminOrderDetail, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';
import { AdminOrderStatusBadge } from './AdminOrderStatusBadge';

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not set';
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

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
    <Modal opened={opened} onClose={onClose} title="Order Details" size="xl" centered>
      {loading || !order ? (
        <Text c="dimmed">Loading order...</Text>
      ) : (
        <ScrollArea.Autosize mah="calc(100vh - 180px)" offsetScrollbars>
          <Stack gap="lg" pr="sm">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Paper withBorder radius="md" p="md" className="enterprise-panel">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                        Customer
                      </Text>
                      <Text fw={800} size="lg">{order.customer.name}</Text>
                    </div>
                    <AdminOrderStatusBadge status={order.status} />
                  </Group>
                  <Stack gap={4}>
                    <Text size="sm">Email: {order.customer.email || 'Not provided'}</Text>
                    <Text size="sm">Phone: {order.customer.phone || 'Not provided'}</Text>
                    <Text size="sm">Address: {order.customer.address || 'Not provided'}</Text>
                  </Stack>
                  <Divider />
                  <Text size="sm">Created: {formatDateTime(order.createdAt)}</Text>
                  <Text size="sm">Updated: {formatDateTime(order.updatedAt)}</Text>
                  <Text size="sm">Reservation expires: {formatDateTime(order.reservationExpiresAt)}</Text>
                  {(order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch') ? (
                    <Text size="sm" c="teal" fw={700}>
                      Customer readiness notification has been queued.
                    </Text>
                  ) : null}
                </Stack>
              </Paper>

              <Paper withBorder radius="md" p="md" className="enterprise-panel">
                <Stack gap="sm">
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Payment truth
                  </Text>
                  {order.payments.length === 0 ? (
                    <Text size="sm" c="dimmed">No payment record yet.</Text>
                  ) : (
                    order.payments.map((payment) => (
                      <Paper key={payment.id} withBorder radius="md" p="sm" className="enterprise-panel">
                        <Group justify="space-between" gap="sm">
                          <div>
                            <Text fw={700}>{payment.provider.replaceAll('_', ' ')}</Text>
                            <Text size="xs" c="dimmed">{formatDateTime(payment.createdAt)}</Text>
                          </div>
                          <Badge variant="light">{payment.status.replaceAll('_', ' ')}</Badge>
                        </Group>
                        <Text mt={6} size="sm">
                          {formatMoney(payment.amountCents, payment.currency)}
                        </Text>
                      </Paper>
                    ))
                  )}
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={800}>Order total</Text>
                    <Text fw={800}>{formatMoney(order.totalCents, order.currency)}</Text>
                  </Group>
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="md" p="md" className="enterprise-panel">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Items
                    </Text>
                    <Text fw={800}>{order.items.length} order line{order.items.length === 1 ? '' : 's'}</Text>
                  </div>
                  <Text fw={800}>{formatMoney(order.totalCents, order.currency)}</Text>
                </Group>
                <Table.ScrollContainer minWidth={680}>
                  <Table verticalSpacing="sm" className="admin-unified-table">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>SKU</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Unit</Table.Th>
                        <Table.Th>Total</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {order.items.map((item) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>{item.productName}</Table.Td>
                          <Table.Td>{item.skuName}</Table.Td>
                          <Table.Td>{item.quantity}</Table.Td>
                          <Table.Td>{formatMoney(item.unitPriceCents, order.currency)}</Table.Td>
                          <Table.Td>{formatMoney(item.lineTotalCents, order.currency)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Stack>
            </Paper>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Paper withBorder radius="md" p="md" className="enterprise-panel">
                <Stack gap="sm">
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Reservations
                  </Text>
                  {order.reservations.length === 0 ? (
                    <Text size="sm" c="dimmed">No inventory reservation is attached.</Text>
                  ) : (
                    order.reservations.map((reservation) => (
                      <Group key={reservation.id} justify="space-between" gap="sm">
                        <div>
                          <Text size="sm" fw={700}>SKU {reservation.skuId}</Text>
                          <Text size="xs" c="dimmed">Expires {formatDateTime(reservation.expiresAt)}</Text>
                        </div>
                        <Badge color={reservation.committed ? 'green' : 'yellow'} variant="light">
                          {reservation.quantity} {reservation.committed ? 'committed' : 'held'}
                        </Badge>
                      </Group>
                    ))
                  )}
                </Stack>
              </Paper>

              <Paper withBorder radius="md" p="md" className="enterprise-panel">
                <Stack gap="sm">
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    History
                  </Text>
                  {order.history.map((item) => (
                    <div key={item.id}>
                      <Text size="sm" fw={700}>
                        {adminOrderStatusLabels[item.status] ?? item.status}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(item.createdAt)} - {item.reason ?? 'No note'}
                      </Text>
                    </div>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </ScrollArea.Autosize>
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
