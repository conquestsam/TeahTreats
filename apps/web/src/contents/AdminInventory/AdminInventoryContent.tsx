'use client';

import { Button, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';
import { AdminInventoryAdjustModal } from '@/components/AdminInventory/AdminInventoryAdjustModal';
import { AdminInventoryConfirmModal } from '@/components/AdminInventory/AdminInventoryConfirmModal';
import { AdminInventoryCreateBatchModal } from '@/components/AdminInventory/AdminInventoryCreateBatchModal';
import { AdminInventoryDetailsModal } from '@/components/AdminInventory/AdminInventoryDetailsModal';
import { AdminInventoryMobileCard } from '@/components/AdminInventory/AdminInventoryMobileCard';

import { AdminInventoryTable } from '@/components/AdminInventory/AdminInventoryTable';
import {
  useAdjustInventoryBatchForm,
  useCreateInventoryBatchForm
} from '@/hooks/AdminInventory/useAdminInventoryForms';
import { useAdminInventoryModals } from '@/hooks/AdminInventory/useAdminInventoryModals';
import { useAdminInventoryMutations } from '@/hooks/AdminInventory/useAdminInventoryMutations';
import {
  useAdminInventoryBatchQuery,
  useAdminInventorySkuQuery
} from '@/hooks/AdminInventory/useAdminInventoryQuery';
import { MetricCard } from '@/components/ui/metric-card';
import { AdminInventoryEmptyState } from './AdminInventoryEmptyState';
import { AdminInventoryHeader } from './AdminInventoryHeader';
import { AdminInventoryLoadingState } from './AdminInventoryLoadingState';

export function AdminInventoryContent() {
  const modals = useAdminInventoryModals();
  const batchesQuery = useAdminInventoryBatchQuery();
  const skuQuery = useAdminInventorySkuQuery();
  const createForm = useCreateInventoryBatchForm();
  const adjustForm = useAdjustInventoryBatchForm();

  const resetAndClose = () => {
    createForm.reset();
    adjustForm.reset();
    modals.closeModal();
  };

  const mutations = useAdminInventoryMutations(resetAndClose);
  const batches = useMemo(() => batchesQuery.data ?? [], [batchesQuery.data]);
  const skuOptions = skuQuery.data ?? [];
  const [search, setSearch] = useState('');

  const openCreate = () => {
    createForm.setValues({
      skuId: skuOptions[0]?.id ?? '',
      quantity: 0,
      expiresAt: '',
      reason: 'Fresh batch received.',
      batchCode: '',
      storageLocation: '',
      storageZone: '',
      source: 'Internal Kitchen',
      qualityChecked: true
    });
    modals.openCreate();
  };

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return batches;
    }
    return batches.filter((batch) =>
      [
        batch.productName,
        batch.skuName,
        batch.batchCode,
        batch.storageLocation,
        batch.storageZone,
        batch.source,
        batch.statusLabel
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [batches, search]);

  const availableTotal = batches.reduce((total, batch) => total + batch.available, 0);
  const reservedTotal = batches.reduce((total, batch) => total + batch.reserved, 0);
  const expiredCount = batches.filter((batch) => batch.status === 'expired').length;
  const lowStockCount = batches.filter((batch) => batch.status === 'low_stock' || batch.status === 'out_of_stock').length;
  const expiringSoonCount = batches.filter((batch) => {
    if (!batch.expiresAt || batch.status === 'expired') {
      return false;
    }
    const ms = new Date(batch.expiresAt).getTime() - Date.now();
    return ms > 0 && ms <= 3 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AdminInventoryHeader onCreate={openCreate} />

        <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics admin-inventory-metrics">
          <MetricCard label="Available Stock" value={availableTotal} hint="Ready to sell" tone="green" />
          <MetricCard label="Expiring Soon" value={expiringSoonCount} hint="Review today" tone="orange" />
          <MetricCard label="Low Stock" value={lowStockCount} hint="Restock soon" tone="red" />
          <MetricCard label="Reserved" value={reservedTotal} hint="Held for orders" tone="blue" />
        </SimpleGrid>

        <div className="admin-mobile-queue-tools admin-inventory-tools">
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search batch, product, or storage..."
            aria-label="Search inventory"
          />
          <Group justify="space-between" wrap="nowrap" className="admin-mobile-section-label">
            <Text size="xs" fw={900} tt="uppercase">{filteredBatches.length} Batches</Text>
            <Button size="xs" variant="subtle" onClick={() => batchesQuery.refetch()}>
              Refresh
            </Button>
          </Group>
        </div>

        {batchesQuery.isLoading ? (
          <AdminInventoryLoadingState />
        ) : batches.length === 0 ? (
          <AdminInventoryEmptyState />
        ) : (
          <>
            <div className="admin-inventory-mobile-list">
              {filteredBatches.map((batch) => (
                <AdminInventoryMobileCard
                  key={batch.id}
                  batch={batch}
                  onDetails={modals.openDetails}
                  onAdjust={modals.openAdjust}
                  onExpire={modals.openExpire}
                />
              ))}
            </div>
            <div className="admin-inventory-desktop-table">
              <AdminInventoryTable
                batches={filteredBatches}
                onDetails={modals.openDetails}
                onAdjust={modals.openAdjust}
                onExpire={modals.openExpire}
              />
            </div>
          </>
        )}
      </Stack>

      <AdminInventoryCreateBatchModal
        opened={modals.mode === 'create'}
        loading={mutations.createMutation.isPending}
        skus={skuOptions}
        form={createForm}
        onClose={resetAndClose}
        onSubmit={() =>
          mutations.createMutation.mutate({
            skuId: createForm.values.skuId,
            quantity: createForm.values.quantity,
            reason: createForm.values.reason,
            ...(createForm.values.batchCode ? { batchCode: createForm.values.batchCode } : {}),
            ...(createForm.values.storageLocation ? { storageLocation: createForm.values.storageLocation } : {}),
            ...(createForm.values.storageZone ? { storageZone: createForm.values.storageZone } : {}),
            ...(createForm.values.source ? { source: createForm.values.source } : {}),
            ...(createForm.values.qualityChecked !== undefined ? { qualityChecked: createForm.values.qualityChecked } : {}),
            ...(createForm.values.expiresAt
              ? { expiresAt: new Date(createForm.values.expiresAt).toISOString() }
              : {})
          })
        }
      />

      <AdminInventoryAdjustModal
        opened={modals.mode === 'adjust'}
        loading={mutations.adjustMutation.isPending}
        batch={modals.selectedBatch}
        form={adjustForm}
        onClose={resetAndClose}
        onSubmit={() => {
          if (modals.selectedBatch) {
            mutations.adjustMutation.mutate({
              batchId: modals.selectedBatch.id,
              adjustment: adjustForm.values
            });
          }
        }}
      />

      <AdminInventoryDetailsModal
        opened={modals.mode === 'details'}
        batch={modals.selectedBatch}
        onClose={resetAndClose}
      />

      <AdminInventoryConfirmModal
        opened={modals.mode === 'expire'}
        loading={mutations.expireMutation.isPending}
        title="Expire Batch"
        body={`Mark ${modals.selectedBatch?.productName ?? 'this batch'} as expired? It will no longer be sellable.`}
        confirmLabel="Expire"
        onClose={resetAndClose}
        onConfirm={() => {
          if (modals.selectedBatch) {
            mutations.expireMutation.mutate(modals.selectedBatch.id);
          }
        }}
      />
    </div>
  );
}
