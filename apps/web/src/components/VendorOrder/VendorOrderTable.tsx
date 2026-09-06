'use client';

import { Button, Paper, Table, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { VendorOrderRow } from '@/types/VendorOrder/vendorOrderTypes';
import { VendorOrderStatusBadge } from './VendorOrderStatusBadge';

interface VendorOrderTableProps {
  orders: VendorOrderRow[];
  onView: (order: VendorOrderRow) => void;
}

export function VendorOrderTable({ orders, onView }: VendorOrderTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={820}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <Text fw={800}>{order.customer.name}</Text>
                  <Text size="sm" c="dimmed">{order.customer.email ?? 'No email'}</Text>
                </Table.Td>
                <Table.Td><VendorOrderStatusBadge status={order.status} /></Table.Td>
                <Table.Td>{order.itemCount}</Table.Td>
                <Table.Td>{formatMoney(order.totalCents, order.currency)}</Table.Td>
                <Table.Td>{new Date(order.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Button size="xs" variant="light" onClick={() => onView(order)}>
                    View Order
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
