import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'cart',
  'checkout_started',
  'inventory_reserved',
  'payment_pending',
  'manual_payment_proof_submitted',
  'awaiting_admin_payment_approval',
  'payment_approved',
  'paid',
  'preparing',
  'ready_for_pickup_dispatch',
  'completed',
  'cancelled',
  'refunded',
  'partially_refunded',
  'payment_failed',
  'expired'
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;
