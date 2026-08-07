import type { OrderStatusValue } from '@snacks/shared';
import { adminOrderStatusLabels } from '@snacks/shared';

export function getEffectiveOrderStatus(
  status: OrderStatusValue | string,
  reservationExpiresAt?: string | Date | null
): { label: string; statusKey: string; className: string } {
  // Check if stock reservation has expired for an unpaid order
  const nonExpiredStatuses = [
    'completed',
    'paid',
    'payment_approved',
    'preparing',
    'ready_for_pickup',
    'ready_for_pickup_dispatch',
    'cancelled',
    'refunded',
    'expired'
  ];

  if (
    reservationExpiresAt &&
    new Date(reservationExpiresAt) <= new Date() &&
    !nonExpiredStatuses.includes(status)
  ) {
    return { label: 'Expired', statusKey: 'expired', className: 'tt-badge-out-of-stock' };
  }

  const label = adminOrderStatusLabels[status as OrderStatusValue] ?? status.replaceAll('_', ' ');

  switch (status) {
    case 'completed':
    case 'paid':
    case 'payment_approved':
      return { label, statusKey: status, className: 'tt-badge-in-stock' };
    case 'preparing':
    case 'ready_for_pickup':
    case 'ready_for_pickup_dispatch':
      return { label, statusKey: status, className: 'tt-badge-gold' };
    case 'awaiting_admin_payment_approval':
    case 'manual_payment_proof_submitted':
      return { label: 'Payment Under Review', statusKey: status, className: 'tt-badge-gold' };
    case 'inventory_reserved':
    case 'payment_pending':
    case 'checkout_started':
      return { label: 'Payment Pending', statusKey: status, className: 'tt-badge-low-stock' };
    case 'cancelled':
    case 'refunded':
    case 'payment_failed':
    case 'expired':
      return { label, statusKey: status, className: 'tt-badge-out-of-stock' };
    default:
      return { label, statusKey: status, className: 'tt-badge-gold' };
  }
}

export function CustomerOrderStatusBadge({
  status,
  reservationExpiresAt
}: {
  status: string;
  reservationExpiresAt?: string | Date | null;
}) {
  const badge = getEffectiveOrderStatus(status, reservationExpiresAt);
  return (
    <span
      className={badge.className}
      style={{
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap'
      }}
    >
      {badge.label}
    </span>
  );
}
