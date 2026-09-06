import type { OrderStatusValue } from './order.js';
import type { ProductStatus } from '../schemas/catalog.js';

export type VendorInventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';

export interface VendorProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  skuCount: number;
  activeSkuCount: number;
  updatedAt: string;
}

export interface VendorProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  status: ProductStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
  skus: Array<{
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    active: boolean;
    metadata: Record<string, unknown>;
  }>;
}

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

export interface VendorOrderCustomer {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface VendorOrderRow {
  id: string;
  status: OrderStatusValue;
  totalCents: number;
  currency: string;
  itemCount: number;
  customer: VendorOrderCustomer;
  reservationExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorOrderDetail extends VendorOrderRow {
  items: Array<{
    id: string;
    skuId: string | null;
    productName: string;
    skuName: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: string;
    amountCents: number;
    currency: string;
    createdAt: string;
  }>;
  history: Array<{
    id: string;
    status: OrderStatusValue;
    reason: string | null;
    createdAt: string;
  }>;
  reservations: Array<{
    id: string;
    batchId: string;
    skuId: string;
    quantity: number;
    expiresAt: string;
    committed: boolean;
  }>;
}
