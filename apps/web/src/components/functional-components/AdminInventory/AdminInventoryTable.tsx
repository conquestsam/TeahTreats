import { Button, Group, Paper, Table, Text } from '@mantine/core';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';
import { AdminInventoryStatusBadge } from './AdminInventoryStatusBadge';

interface AdminInventoryTableProps {
  batches: AdminInventoryBatchModel[];
  onDetails: (batch: AdminInventoryBatchModel) => void;
  onAdjust: (batch: AdminInventoryBatchModel) => void;
  onExpire: (batch: AdminInventoryBatchModel) => void;
}

export function AdminInventoryTable({
  batches,
  onDetails,
  onAdjust,
  onExpire
}: AdminInventoryTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Available</Table.Th>
              <Table.Th>Reserved</Table.Th>
              <Table.Th>Expires</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {batches.map((batch) => (
              <Table.Tr key={batch.id}>
                <Table.Td>
                  <Text fw={700}>{batch.productName}</Text>
                  <Text size="sm" c="dimmed">
                    {batch.skuName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <AdminInventoryStatusBadge batch={batch} />
                </Table.Td>
                <Table.Td>{batch.available}</Table.Td>
                <Table.Td>{batch.reserved}</Table.Td>
                <Table.Td>{batch.expiresAt ? new Date(batch.expiresAt).toLocaleDateString() : 'No expiry'}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => onDetails(batch)}>
                      View
                    </Button>
                    <Button size="xs" onClick={() => onAdjust(batch)}>
                      Adjust
                    </Button>
                    {!batch.expiredAt ? (
                      <Button size="xs" color="red" variant="light" onClick={() => onExpire(batch)}>
                        Expire
                      </Button>
                    ) : null}
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
