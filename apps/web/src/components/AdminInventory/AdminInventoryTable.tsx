import { Button, Group, Image, Paper, Table, Text } from '@mantine/core';
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
    <Paper withBorder className="enterprise-panel overflow-hidden admin-inventory-table">
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Batch</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Available</Table.Th>
              <Table.Th>Storage</Table.Th>
              <Table.Th>Expiry</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {batches.map((batch) => (
              <Table.Tr key={batch.id}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <span className="admin-mobile-item-thumb">
                      {batch.productImageUrl ? <Image src={batch.productImageUrl} alt={batch.productName} /> : <span />}
                    </span>
                    <div>
                      <Text fw={800}>{batch.productName}</Text>
                      <Text size="sm" c="dimmed">{batch.skuName} • {batch.batchCode}</Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <AdminInventoryStatusBadge batch={batch} />
                </Table.Td>
                <Table.Td>
                  <Text fw={900}>{batch.available} {batch.unitLabel}</Text>
                  <Text size="xs" c="dimmed">{batch.reserved} reserved</Text>
                </Table.Td>
                <Table.Td>{[batch.storageLocation, batch.storageZone].filter(Boolean).join(' • ') || 'Not set'}</Table.Td>
                <Table.Td>{batch.expiryLabel}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => onDetails(batch)}>
                      Details
                    </Button>
                    <Button size="xs" onClick={() => onAdjust(batch)}>
                      Adjust Stock
                    </Button>
                    {!batch.expiredAt ? (
                      <Button size="xs" color="red" variant="light" onClick={() => onExpire(batch)}>
                        Mark Expired
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
