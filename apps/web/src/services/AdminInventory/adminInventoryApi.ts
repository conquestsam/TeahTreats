import { apiFetch } from '@/lib/api/client';
import type {
  AdjustInventoryBatchInput,
  AdminInventoryBatchModel,
  AdminInventorySkuOptionModel,
  CreateInventoryBatchInput
} from '@/types/AdminInventory/adminInventoryTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listInventoryBatches() {
  return apiFetch<ApiEnvelope<AdminInventoryBatchModel[]>>('/admin/inventory/batches').then(
    (response) => response.data,
  );
}

export function listInventorySkuOptions() {
  return apiFetch<ApiEnvelope<AdminInventorySkuOptionModel[]>>(
    '/admin/inventory/sku-options',
  ).then((response) => response.data);
}

export function createInventoryBatch(input: CreateInventoryBatchInput) {
  return apiFetch<ApiEnvelope<AdminInventoryBatchModel>>('/admin/inventory/batches', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function adjustInventoryBatch(batchId: string, input: AdjustInventoryBatchInput) {
  return apiFetch<ApiEnvelope<AdminInventoryBatchModel>>(
    `/admin/inventory/batches/${batchId}/adjust`,
    {
      method: 'POST',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}

export function expireInventoryBatch(batchId: string) {
  return apiFetch<ApiEnvelope<AdminInventoryBatchModel>>(
    `/admin/inventory/batches/${batchId}/expire`,
    { method: 'POST' },
  ).then((response) => response.data);
}
