import { apiFetch } from '@/lib/api/client';
import type {
  ApiEnvelope,
  AdjustInventoryBatchInput,
  AdminInventoryBatchSummary,
  AdminInventorySkuOption,
  CreateInventoryBatchInput
} from '@snacks/shared';

export function listInventoryBatches() {
  return apiFetch<ApiEnvelope<AdminInventoryBatchSummary[]>>('/admin/inventory/batches').then(
    (response) => response.data,
  );
}

export function listInventorySkuOptions() {
  return apiFetch<ApiEnvelope<AdminInventorySkuOption[]>>(
    '/admin/inventory/sku-options',
  ).then((response) => response.data);
}

export function createInventoryBatch(input: CreateInventoryBatchInput) {
  return apiFetch<ApiEnvelope<AdminInventoryBatchSummary>>('/admin/inventory/batches', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function adjustInventoryBatch(batchId: string, input: AdjustInventoryBatchInput) {
  return apiFetch<ApiEnvelope<AdminInventoryBatchSummary>>(
    `/admin/inventory/batches/${batchId}/adjust`,
    {
      method: 'POST',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}

export function expireInventoryBatch(batchId: string) {
  return apiFetch<ApiEnvelope<AdminInventoryBatchSummary>>(
    `/admin/inventory/batches/${batchId}/expire`,
    { method: 'POST' },
  ).then((response) => response.data);
}
