import type { AdminInventoryBatchSummary, AdminInventorySkuOption } from '@snacks/shared';
export type { AdjustInventoryBatchInput, CreateInventoryBatchInput } from '@snacks/shared';

export type AdminInventoryBatchModel = AdminInventoryBatchSummary;
export type AdminInventorySkuOptionModel = AdminInventorySkuOption;

export type AdminInventoryModalMode = 'closed' | 'create' | 'adjust' | 'details' | 'expire';
