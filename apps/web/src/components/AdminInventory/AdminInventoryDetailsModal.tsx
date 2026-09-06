'use client';

import { Badge, Group, Modal, Stack, Table, Text } from '@mantine/core';
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
    <Modal
      opened={opened}
      onClose={onClose}
      title="Batch History"
      centered
      size="lg"
      classNames={{ content: 'admin-mobile-modal-content', header: 'admin-mobile-modal-header', body: 'admin-mobile-modal-body' }}
    >
      {batch ? (
        <Stack>
          <div>
            <Text fw={700}>{batch.productName}</Text>
            <Text size="sm" c="dimmed">
              {batch.skuName} • {batch.batchCode}
            </Text>
          </div>
          <Group gap="xs">
            <Badge variant="light">{batch.statusLabel}</Badge>
            <Badge variant="light" color="yellow">{batch.expiryLabel}</Badge>
            {batch.qualityChecked ? <Badge variant="light" color="green">Checked</Badge> : null}
          </Group>
          <Text size="sm">Available: {batch.available} {batch.unitLabel} • Reserved: {batch.reserved} {batch.unitLabel}</Text>
          <Text size="sm" c="dimmed">Storage: {[batch.storageLocation, batch.storageZone].filter(Boolean).join(' • ') || 'Not set'}</Text>
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Change</Table.Th>
                  <Table.Th>Note</Table.Th>
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
