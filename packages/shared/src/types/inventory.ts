export type InventoryAdjustmentType =
  | 'initial'
  | 'increase'
  | 'decrease'
  | 'expire'
  | 'correction'
  | 'reservation'
  | 'release';

export interface AdminInventoryAdjustmentSummary {
  id: string;
  batchId: string;
  type: InventoryAdjustmentType;
  quantityDelta: number;
  reason: string;
  createdAt: string;
}

export interface AdminInventoryBatchSummary {
  id: string;
  tenantId: string;
  skuId: string;
  skuName: string;
  productId: string;
  productName: string;
  productStatus: string;
  productImageUrl: string | null;
  batchCode: string;
  quantity: number;
  reserved: number;
  available: number;
  unitLabel: string;
  storageLocation: string | null;
  storageZone: string | null;
  source: string | null;
  qualityChecked: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  statusLabel: string;
  expiryLabel: string;
  metadata: Record<string, unknown>;
  expiresAt: string | null;
  expiredAt: string | null;
  sellable: boolean;
  createdAt: string;
  updatedAt: string;
  adjustments: AdminInventoryAdjustmentSummary[];
}

export interface AdminInventorySkuOption {
  id: string;
  name: string;
  productId: string;
  productName: string;
  productStatus: string;
  active: boolean;
  isPerishable: boolean;
  priceCents: number;
  currency: string;
  unitLabel: string;
  imageUrl: string | null;
  available: number;
}

export interface CreateInventoryBatchInput {
  skuId: string;
  quantity: number;
  expiresAt?: string;
  reason: string;
  batchCode?: string;
  storageLocation?: string;
  storageZone?: string;
  source?: string;
  qualityChecked?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AdjustInventoryBatchInput {
  quantityDelta: number;
  reason: string;
}

export interface ReserveInventoryInput {
  skuId: string;
  quantity: number;
  orderId?: string;
}
