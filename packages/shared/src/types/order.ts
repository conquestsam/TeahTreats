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
