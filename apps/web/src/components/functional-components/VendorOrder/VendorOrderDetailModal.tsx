'use client';

import { Group, Loader, Modal, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { VendorOrderDetail } from '@/types/VendorOrder/vendorOrderTypes';
import { VendorOrderStatusBadge } from './VendorOrderStatusBadge';

interface VendorOrderDetailModalProps {
  opened: boolean;
  loading?: boolean;
  order: VendorOrderDetail | undefined;
  onClose: () => void;
}

export function VendorOrderDetailModal({
  opened,
  loading,
  order,
  onClose
}: VendorOrderDetailModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Order Detail" size="xl" centered>
      {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : order ? (
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={900} size="lg">Order {order.id.slice(0, 8)}</Text>
              <Text size="sm" c="dimmed">{new Date(order.createdAt).toLocaleString()}</Text>
            </div>
            <VendorOrderStatusBadge status={order.status} />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Info label="Customer" value={order.customer.name} />
            <Info label="Phone" value={order.customer.phone ?? 'No phone'} />
            <Info label="Total" value={formatMoney(order.totalCents, order.currency)} />
          </SimpleGrid>
          <Info label="Address" value={order.customer.address ?? 'No address'} />

          <Stack gap="xs">
            <Text fw={900}>Items</Text>
            <Table.ScrollContainer minWidth={560}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Qty</Table.Th>
                    <Table.Th>Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {order.items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>{item.productName}</Table.Td>
                      <Table.Td>{item.skuName}</Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>{formatMoney(item.lineTotalCents, order.currency)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Stack gap="xs" className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <Text fw={900}>Payments</Text>
              {order.payments.length === 0 ? <Text size="sm" c="dimmed">No payments yet.</Text> : null}
              {order.payments.map((payment) => (
                <Text key={payment.id} size="sm">
                  {payment.provider} · {payment.status} · {formatMoney(payment.amountCents, payment.currency)}
                </Text>
              ))}
            </Stack>
            <Stack gap="xs" className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <Text fw={900}>History</Text>
              {order.history.length === 0 ? <Text size="sm" c="dimmed">No status history yet.</Text> : null}
              {order.history.slice(0, 5).map((history) => (
                <Text key={history.id} size="sm">
                  {history.status.replaceAll('_', ' ')} · {new Date(history.createdAt).toLocaleDateString()}
                </Text>
              ))}
            </Stack>
          </SimpleGrid>
        </Stack>
      ) : (
        <Text c="dimmed">Select an order to view details.</Text>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={700}>{value}</Text>
    </div>
  );
}
