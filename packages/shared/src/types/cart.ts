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
  checkoutMode: CustomerCheckoutMode;
  isGuestCheckout: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
    recipientName?: string;
    fulfillmentMethod?: CustomerFulfillmentMethod;
    deliverySlotId?: string;
    deliveryWindowLabel?: string;
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

export interface AddCartItemInput {
  skuId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CheckoutCustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  fulfillmentMethod?: CustomerFulfillmentMethod;
  recipientName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  handoffInstructions?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  deliverySlotId?: string;
  couponCode?: string;
}

export type CustomerFulfillmentMethod = 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';
export type CustomerCheckoutMode = 'guest' | 'account';

export interface DeliverySlot {
  id: string;
  label: string;
  method: CustomerFulfillmentMethod;
  startTime: string;
  endTime: string;
  feeCents: number;
  capacity: number;
  cutoffTime: string;
  active: boolean;
  hubId?: string | null;
  storeId?: string | null;
  bookedCount: number;
  remainingCapacity: number;
}

export interface ValidateCouponInput {
  code: string;
  email?: string;
}
