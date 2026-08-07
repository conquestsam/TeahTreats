import type { AdminInventoryBatchSummary, AdminInventorySkuOption } from '@snacks/shared';

export type AdminInventoryBatchModel = AdminInventoryBatchSummary;
export type AdminInventorySkuOptionModel = AdminInventorySkuOption;

export interface CreateInventoryBatchInput {
  skuId: string;
  quantity: number;
  expiresAt?: string;
  reason: string;
}

export interface AdjustInventoryBatchInput {
  quantityDelta: number;
  reason: string;
}

export type AdminInventoryModalMode = 'closed' | 'create' | 'adjust' | 'details' | 'expire';
