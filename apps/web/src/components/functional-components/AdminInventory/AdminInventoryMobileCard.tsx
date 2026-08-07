import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';
import { AdminInventoryStatusBadge } from './AdminInventoryStatusBadge';

interface AdminInventoryMobileCardProps {
  batch: AdminInventoryBatchModel;
  onDetails: (batch: AdminInventoryBatchModel) => void;
  onAdjust: (batch: AdminInventoryBatchModel) => void;
  onExpire: (batch: AdminInventoryBatchModel) => void;
}

export function AdminInventoryMobileCard({
  batch,
  onDetails,
  onAdjust,
  onExpire
}: AdminInventoryMobileCardProps) {
  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <div>
            <Text fw={700}>{batch.productName}</Text>
            <Text size="sm" c="dimmed">
              {batch.skuName}
            </Text>
          </div>
          <AdminInventoryStatusBadge batch={batch} />
        </Group>
        <Group gap="lg">
          <Text size="sm">Available: {batch.available}</Text>
          <Text size="sm">Reserved: {batch.reserved}</Text>
        </Group>
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
      </Stack>
    </Paper>
  );
}
