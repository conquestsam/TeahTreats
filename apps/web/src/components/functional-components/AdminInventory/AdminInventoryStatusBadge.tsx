import { Badge } from '@mantine/core';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';

export function AdminInventoryStatusBadge({ batch }: { batch: AdminInventoryBatchModel }) {
  if (batch.expiredAt || (batch.expiresAt && new Date(batch.expiresAt) <= new Date())) {
    return <Badge color="red">Expired</Badge>;
  }

  if (!batch.sellable) {
    return <Badge color="yellow">Not Sellable</Badge>;
  }

  return <Badge color="green">Sellable</Badge>;
}
