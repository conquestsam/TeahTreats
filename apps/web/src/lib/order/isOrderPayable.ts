export function isOrderPayable(order: {
  status: string;
  reservationExpiresAt?: string | Date | null;
}): boolean {
  const terminalStatuses = [
    'expired',
    'cancelled',
    'refunded',
    'paid',
    'completed',
    'preparing',
    'ready_for_pickup',
    'ready_for_pickup_dispatch'
  ];

  if (terminalStatuses.includes(order.status)) {
    return false;
  }

  if (order.reservationExpiresAt && new Date(order.reservationExpiresAt) <= new Date()) {
    return false;
  }

  return (
    order.status === 'created' ||
    order.status === 'inventory_reserved' ||
    order.status === 'payment_pending' ||
    order.status === 'requires_action' ||
    order.status === 'manual_proof_required' ||
    order.status === 'checkout_started'
  );
}
