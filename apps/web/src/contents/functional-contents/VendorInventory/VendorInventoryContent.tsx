'use client';

import { SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { VendorInventoryDetailModal } from '@/components/functional-components/VendorInventory/VendorInventoryDetailModal';
import { VendorInventoryMobileCard } from '@/components/functional-components/VendorInventory/VendorInventoryMobileCard';
import { VendorInventoryTable } from '@/components/functional-components/VendorInventory/VendorInventoryTable';
import {
  useVendorInventoryDetailQuery,
  useVendorInventoryQuery
} from '@/hooks/VendorInventory/useVendorInventoryQuery';
import type { VendorInventoryRow } from '@/types/VendorInventory/vendorInventoryTypes';

export function VendorInventoryContent() {
  const [selectedBatch, setSelectedBatch] = useState<VendorInventoryRow | null>(null);
  const inventoryQuery = useVendorInventoryQuery();
  const detailQuery = useVendorInventoryDetailQuery(selectedBatch?.id ?? null);
  const batches = inventoryQuery.data ?? [];

  return (
    <div className="admin-container pb-24 pt-6 md:pb-10 md:pt-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Vendor Inventory</Title>
          <Text c="dimmed">View stock batches, low stock, and expired items.</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 4 }}>
          <MetricCard label="Batches" value={batches.length} hint="Stock records" tone="green" />
          <MetricCard label="Available" value={batches.reduce((sum, batch) => sum + batch.available, 0)} hint="Sellable units" tone="blue" />
          <MetricCard label="Low Stock" value={batches.filter((batch) => batch.status === 'low_stock').length} hint="Needs attention" tone="orange" />
          <MetricCard label="Expired" value={batches.filter((batch) => batch.status === 'expired').length} hint="Not sellable" tone="gray" />
        </SimpleGrid>

        {inventoryQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Skeleton h={140} />
            <Skeleton h={140} />
          </SimpleGrid>
        ) : inventoryQuery.isError ? (
          <StateCard title="Inventory unavailable" description="Check your tenant access and try again." tone="warning" />
        ) : batches.length === 0 ? (
          <StateCard title="No inventory yet" description="Stock batches created for this tenant will appear here." />
        ) : (
          <>
            <div className="hidden md:block">
              <VendorInventoryTable batches={batches} onView={setSelectedBatch} />
            </div>
            <SimpleGrid cols={{ base: 1, sm: 2 }} className="md:hidden">
              {batches.map((batch) => (
                <VendorInventoryMobileCard key={batch.id} batch={batch} onView={setSelectedBatch} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>

      <VendorInventoryDetailModal
        opened={Boolean(selectedBatch)}
        loading={detailQuery.isLoading}
        batch={detailQuery.data}
        onClose={() => setSelectedBatch(null)}
      />
    </div>
  );
}
