export const orderStatuses = [
  'cart',
  'checkout_started',
  'inventory_reserved',
  'payment_pending',
  'manual_payment_proof_submitted',
  'awaiting_admin_payment_approval',
  'payment_approved',
  'paid',
  'preparing',
  'ready_for_pickup',
  'ready_for_pickup_dispatch',
  'completed',
  'cancelled',
  'refunded',
  'partially_refunded',
  'payment_failed',
  'expired'
] as const;

export type OrderStatusValue = (typeof orderStatuses)[number];

export const adminOrderStatusLabels: Record<OrderStatusValue, string> = {
  cart: 'Cart',
  checkout_started: 'Checkout started',
  inventory_reserved: 'Inventory reserved',
  payment_pending: 'Payment pending',
  manual_payment_proof_submitted: 'Manual proof submitted',
  awaiting_admin_payment_approval: 'Awaiting payment review',
  payment_approved: 'Payment approved',
  paid: 'Paid',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  ready_for_pickup_dispatch: 'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  partially_refunded: 'Partially refunded',
  payment_failed: 'Payment failed',
  expired: 'Expired'
};

export const orderLifecycleActions = ['mark_preparing', 'mark_ready', 'mark_completed', 'cancel'] as const;

export type OrderLifecycleAction = (typeof orderLifecycleActions)[number];

export interface AdminOrderItemPreview {
  productName: string;
  skuName: string;
  quantity: number;
  imageUrl: string | null;
}

export interface AdminOrderTimelineItem {
  id: string;
  status: OrderStatusValue;
  label: string;
  reason: string | null;
  actorId: string | null;
  createdAt: string;
}

export interface AdminOrderListItem {
  id: string;
  shortRef: string;
  checkoutMode: 'guest' | 'account';
  isGuestCheckout: boolean;
  status: OrderStatusValue;
  statusLabel: string;
  totalCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerSummary: string;
  itemCount: number;
  itemPreview: AdminOrderItemPreview[];
  paymentStatus: string | null;
  paymentStatusLabel: string | null;
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
    fulfillmentMethod?: 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';
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
    deliverySlotSnapshot?: {
      id: string;
      label: string;
      method: 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';
      startTime: string;
      endTime: string;
      feeCents: number;
      capacity: number;
      cutoffTime: string;
      hubId?: string | null;
      storeId?: string | null;
    };
    deliveryWindowLabel?: string;
  };
  items: Array<{
    id: string;
    skuId: string | null;
    productName: string;
    skuName: string;
    imageUrl: string | null;
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
  history: AdminOrderTimelineItem[];
  reservations: Array<{
    id: string;
    batchId: string;
    skuId: string;
    quantity: number;
    expiresAt: string;
    committed: boolean;
  }>;
}

export type CustomerOrderListItem = AdminOrderListItem;
export type CustomerOrderDetail = AdminOrderDetail;

export type AdminOrderAction = 'prepare' | 'ready' | 'complete' | 'cancel';

export interface CancelOrderInput {
  reason: string;
}

export interface CompleteCustomerOrderInput {
  email: string;
  phone: string;
}

export interface ClaimGuestOrderInput extends CompleteCustomerOrderInput {
  orderId: string;
}
