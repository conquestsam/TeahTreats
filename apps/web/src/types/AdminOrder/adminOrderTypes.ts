import type { OrderStatusValue } from '@snacks/shared';

export interface AdminOrderListItem {
  id: string;
  status: OrderStatusValue;
  totalCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
  paymentStatus: string | null;
  reservationExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
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
    actorId: string | null;
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

export type AdminOrderAction = 'prepare' | 'ready' | 'complete' | 'cancel';
