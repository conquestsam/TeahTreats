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
    const expectedEmail = String(customer.email).trim().toLowerCase();
    const actualEmail = input.email.trim().toLowerCase();
    const expectedPhone = this.normalizePhone(String(customer.phone));
    const actualPhone = this.normalizePhone(input.phone);

    if (expectedEmail !== actualEmail || expectedPhone !== actualPhone) {
      throw new BadRequestException('Customer details do not match this order.');
    }
  }

  private static normalizePhone(value: string) {
    return value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  }
}
