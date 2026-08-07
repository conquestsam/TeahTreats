import type { OrderStatusValue } from '@snacks/shared';

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
