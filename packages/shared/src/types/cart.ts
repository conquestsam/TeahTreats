export interface CustomerCartItemSummary {
  id: string;
  skuId: string;
  productId: string;
  productName: string;
  skuName: string;
  unitPriceCents: number;
  currency: string;
  quantity: number;
  lineTotalCents: number;
}

export interface CustomerCartSummary {
  id: string;
  tenantId: string;
  items: CustomerCartItemSummary[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  discountLines: Array<{
    code?: string;
    label: string;
    amountCents: number;
  }>;
  updatedAt: string;
}

export interface CheckoutStartedSummary {
  orderId: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  discountLines: Array<{
    code?: string;
    label: string;
    amountCents: number;
  }>;
  reservationExpiresAt: string;
}
