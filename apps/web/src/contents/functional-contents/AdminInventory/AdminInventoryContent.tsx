'use client';

import { SimpleGrid, Stack } from '@mantine/core';
import { useMemo } from 'react';
import { AdminInventoryAdjustModal } from '@/components/functional-components/AdminInventory/AdminInventoryAdjustModal';
import { AdminInventoryConfirmModal } from '@/components/functional-components/AdminInventory/AdminInventoryConfirmModal';
import { AdminInventoryCreateBatchModal } from '@/components/functional-components/AdminInventory/AdminInventoryCreateBatchModal';
import { AdminInventoryDetailsModal } from '@/components/functional-components/AdminInventory/AdminInventoryDetailsModal';

import { AdminInventoryTable } from '@/components/functional-components/AdminInventory/AdminInventoryTable';
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

  const openCreate = () => {
    createForm.setValues({
      skuId: skuOptions[0]?.id ?? '',
      quantity: 0,
      expiresAt: '',
      reason: ''
    });
    modals.openCreate();
  };

  const availableTotal = batches.reduce((total, batch) => total + batch.available, 0);
  const reservedTotal = batches.reduce((total, batch) => total + batch.reserved, 0);
  const expiredCount = batches.filter((batch) => batch.expiredAt).length;
  const lowStockCount = batches.filter((batch) => batch.available > 0 && batch.available <= 5).length;

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AdminInventoryHeader onCreate={openCreate} />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard label="Available units" value={availableTotal} hint="Sellable batch stock" tone="green" />
          <MetricCard label="Reserved" value={reservedTotal} hint="Held for checkout" tone="blue" />
          <MetricCard label="Low stock" value={lowStockCount} hint="Needs attention" tone="orange" />
          <MetricCard label="Expired" value={expiredCount} hint="Not sellable" tone="red" />
        </SimpleGrid>

        {batchesQuery.isLoading ? (
          <AdminInventoryLoadingState />
        ) : batches.length === 0 ? (
          <AdminInventoryEmptyState />
        ) : (
          <div style={{ overflowX: 'auto' }}>
              <AdminInventoryTable
                batches={batches}
                onDetails={modals.openDetails}
                onAdjust={modals.openAdjust}
                onExpire={modals.openExpire}
              />
          </div>
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
