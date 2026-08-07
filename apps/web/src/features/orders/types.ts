import type { OrderStatus } from '@snacks/shared';

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  totalCents: number;
  customerName: string;
}
