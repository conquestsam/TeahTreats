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
  quantity: number;
  reserved: number;
  available: number;
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
}
