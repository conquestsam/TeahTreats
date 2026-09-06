'use client';

import { Group, Loader, Modal, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import type { VendorInventoryDetail } from '@/types/VendorInventory/vendorInventoryTypes';
import { VendorInventoryStatusBadge } from './VendorInventoryStatusBadge';

interface VendorInventoryDetailModalProps {
  opened: boolean;
  loading?: boolean;
  batch: VendorInventoryDetail | undefined;
  onClose: () => void;
}

export function VendorInventoryDetailModal({
  opened,
  loading,
  batch,
  onClose
}: VendorInventoryDetailModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Batch Detail" size="lg" centered>
      {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : batch ? (
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={900} size="lg">{batch.productName}</Text>
              <Text size="sm" c="dimmed">{batch.skuName}</Text>
            </div>
            <VendorInventoryStatusBadge status={batch.status} />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Info label="Available" value={String(batch.available)} />
            <Info label="Reserved" value={String(batch.reserved)} />
            <Info label="Total" value={String(batch.quantity)} />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Info label="Expires" value={batch.expiresAt ? new Date(batch.expiresAt).toLocaleDateString() : 'No expiry'} />
            <Info label="Updated" value={new Date(batch.updatedAt).toLocaleDateString()} />
          </SimpleGrid>

          <Stack gap="xs">
            <Text fw={900}>Recent Changes</Text>
            <Table.ScrollContainer minWidth={520}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Change</Table.Th>
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
        </Stack>
      ) : (
        <Text c="dimmed">Select a batch to view details.</Text>
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
