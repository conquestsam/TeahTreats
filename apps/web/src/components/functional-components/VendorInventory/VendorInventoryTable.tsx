'use client';

import { Button, Paper, Table, Text } from '@mantine/core';
import type { VendorInventoryRow } from '@/types/VendorInventory/vendorInventoryTypes';
import { VendorInventoryStatusBadge } from './VendorInventoryStatusBadge';

interface VendorInventoryTableProps {
  batches: VendorInventoryRow[];
  onView: (batch: VendorInventoryRow) => void;
}

export function VendorInventoryTable({ batches, onView }: VendorInventoryTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Available</Table.Th>
              <Table.Th>Reserved</Table.Th>
              <Table.Th>Expires</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {batches.map((batch) => (
              <Table.Tr key={batch.id}>
                <Table.Td>
                  <Text fw={800}>{batch.productName}</Text>
                  <Text size="sm" c="dimmed">{batch.skuName}</Text>
                </Table.Td>
                <Table.Td><VendorInventoryStatusBadge status={batch.status} /></Table.Td>
                <Table.Td>{batch.available}</Table.Td>
                <Table.Td>{batch.reserved}</Table.Td>
                <Table.Td>{batch.expiresAt ? new Date(batch.expiresAt).toLocaleDateString() : 'No expiry'}</Table.Td>
                <Table.Td>
                  <Button size="xs" variant="light" onClick={() => onView(batch)}>
                    View Batch
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
