'use client';

import { Badge } from '@mantine/core';
import type { VendorInventoryStatus } from '@/types/VendorInventory/vendorInventoryTypes';

export function VendorInventoryStatusBadge({ status }: { status: VendorInventoryStatus }) {
  const color = status === 'in_stock' ? 'green' : status === 'low_stock' ? 'orange' : 'red';
  const label = status.replaceAll('_', ' ');
  return (
    <Badge color={color} variant="light">
      {label}
    </Badge>
  );
}
