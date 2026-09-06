'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import type { VendorInventoryRow } from '@/types/VendorInventory/vendorInventoryTypes';
import { VendorInventoryStatusBadge } from './VendorInventoryStatusBadge';

interface VendorInventoryMobileCardProps {
  batch: VendorInventoryRow;
  onView: (batch: VendorInventoryRow) => void;
}

export function VendorInventoryMobileCard({ batch, onView }: VendorInventoryMobileCardProps) {
  return (
    <Stack gap="sm" className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Group justify="space-between" align="flex-start">
        <div className="min-w-0">
          <Text fw={900} truncate>{batch.productName}</Text>
          <Text size="xs" c="dimmed" truncate>{batch.skuName}</Text>
        </div>
        <VendorInventoryStatusBadge status={batch.status} />
      </Group>
      <Text size="sm" c="dimmed">
        {batch.available} available · {batch.reserved} reserved
      </Text>
      <Button variant="light" onClick={() => onView(batch)}>
        View Batch
      </Button>
    </Stack>
  );
}
