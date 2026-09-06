import { Badge } from '@mantine/core';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';

export function AdminInventoryStatusBadge({ batch }: { batch: AdminInventoryBatchModel }) {
  const color = batch.status === 'expired' || batch.status === 'out_of_stock'
    ? 'red'
    : batch.status === 'low_stock'
      ? 'yellow'
      : 'green';

  return <Badge color={color} variant="light">{batch.statusLabel}</Badge>;
}
