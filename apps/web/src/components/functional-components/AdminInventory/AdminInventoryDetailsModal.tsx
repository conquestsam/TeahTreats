'use client';

import { Modal, Stack, Table, Text } from '@mantine/core';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';

export function AdminInventoryDetailsModal({
  opened,
  batch,
  onClose
}: {
  opened: boolean;
  batch: AdminInventoryBatchModel | null;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Batch Details" centered size="lg">
      {batch ? (
        <Stack>
          <div>
            <Text fw={700}>{batch.productName}</Text>
            <Text size="sm" c="dimmed">
              {batch.skuName}
            </Text>
          </div>
          <Text size="sm">
            Quantity: {batch.quantity} | Reserved: {batch.reserved} | Available: {batch.available}
          </Text>
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Delta</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {batch.adjustments.map((adjustment) => (
                  <Table.Tr key={adjustment.id}>
                    <Table.Td>{adjustment.type}</Table.Td>
                    <Table.Td>{adjustment.quantityDelta}</Table.Td>
                    <Table.Td>{adjustment.reason}</Table.Td>
                    <Table.Td>{new Date(adjustment.createdAt).toLocaleDateString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Stack>
      ) : null}
    </Modal>
  );
}
