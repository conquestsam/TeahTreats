export const appName = 'Snacks Commerce';

export const apiVersion = 'v1';

export const realtimeTopics = {
  adminOperations: 'admin.operations',
  adminTenant: 'admin.tenant',
  customerOrder: 'customer.order',
  orderUpdates: 'order.updates',
  inventoryAlerts: 'inventory.alerts'
} as const;

export const realtimeEventTypes = {
  orderStatusChanged: 'order.status.changed',
  orderReady: 'order.ready',
  paymentProofSubmitted: 'payment.proof.submitted',
  paymentProofReviewed: 'payment.proof.reviewed',
  inventoryChanged: 'inventory.changed',
  productChanged: 'product.changed',
  cartChanged: 'cart.changed'
} as const;

export const workerJobs = {
  processOutbox: 'process-outbox',
  deliverNotifications: 'deliver-notifications',
  releaseExpiredReservations: 'release-expired-reservations'
} as const;
