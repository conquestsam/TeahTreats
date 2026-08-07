import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

const readyStatuses = new Set<OrderStatus>([
  OrderStatus.ready_for_pickup,
  OrderStatus.ready_for_pickup_dispatch
]);

const terminalStatuses = new Set<OrderStatus>([
  OrderStatus.completed,
  OrderStatus.cancelled,
  OrderStatus.refunded,
  OrderStatus.expired
]);

export class OrderPolicy {
  static ensureCanMarkPreparing(status: OrderStatus) {
    if (status !== OrderStatus.paid) {
      throw new BadRequestException('Only paid orders can be prepared.');
    }
  }

  static ensureCanMarkReady(status: OrderStatus) {
    if (status !== OrderStatus.preparing) {
      throw new BadRequestException('Only preparing orders can be marked ready.');
    }
  }

  static ensureCanMarkCompleted(status: OrderStatus) {
    if (!readyStatuses.has(status)) {
      throw new BadRequestException('Only ready orders can be completed.');
    }
  }

  static ensureCanCancel(status: OrderStatus) {
    if (terminalStatuses.has(status)) {
      throw new BadRequestException('Completed, cancelled, expired, or refunded orders cannot be cancelled.');
    }
  }

  static ensureCustomerMatches(orderCustomer: unknown, input: { email: string; phone: string }) {
    if (!orderCustomer || typeof orderCustomer !== 'object' || Array.isArray(orderCustomer)) {
      throw new BadRequestException('Order customer details are missing.');
    }

    const customer = orderCustomer as Record<string, unknown>;
    if (customer.email !== input.email.toLowerCase() || customer.phone !== input.phone.trim()) {
      throw new BadRequestException('Customer details do not match this order.');
    }
  }
}
