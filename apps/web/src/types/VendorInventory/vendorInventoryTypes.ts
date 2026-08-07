export type VendorInventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';

export interface VendorInventoryRow {
  id: string;
  productName: string;
  skuName: string;
  quantity: number;
  reserved: number;
  available: number;
  status: VendorInventoryStatus;
  expiresAt: string | null;
  expiredAt: string | null;
  updatedAt: string;
}

export interface VendorInventoryDetail extends VendorInventoryRow {
  productId: string;
  skuId: string;
  createdAt: string;
  adjustments: Array<{
    id: string;
    type: string;
    quantityDelta: number;
    reason: string;
    createdAt: string;
  }>;
}
