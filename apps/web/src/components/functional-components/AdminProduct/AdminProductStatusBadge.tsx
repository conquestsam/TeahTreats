import { Badge } from '@mantine/core';
import type { AdminProductModel } from '@/types/AdminProduct/adminProductTypes';

export function AdminProductStatusBadge({
  status
}: Readonly<{ status: AdminProductModel['status'] }>) {
  const color = status === 'active' ? 'green' : status === 'archived' ? 'red' : 'gray';

  return (
    <Badge color={color} variant="light">
      {status}
    </Badge>
  );
}
