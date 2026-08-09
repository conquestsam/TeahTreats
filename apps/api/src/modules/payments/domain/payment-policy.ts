import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class PaymentPolicy {
  static ensureCustomerMatches(orderCustomer: unknown, input: { email: string; phone: string }) {
    if (!orderCustomer || typeof orderCustomer !== 'object' || Array.isArray(orderCustomer)) {
      throw new ForbiddenException('Order verification failed.');
    }

    const customer = orderCustomer as Record<string, unknown>;
    const expectedEmail = String(customer.email).trim().toLowerCase();
    const actualEmail = input.email.trim().toLowerCase();
    const expectedPhone = this.normalizePhone(String(customer.phone));
    const actualPhone = this.normalizePhone(input.phone);

    if (expectedEmail !== actualEmail || expectedPhone !== actualPhone) {
      throw new ForbiddenException('Order verification failed.');
    }
  }

  private static normalizePhone(value: string) {
    return value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  }

  static ensurePayable(order: {
    status: OrderStatus;
    reservationExpiresAt: Date | null;
    payments: { status: PaymentStatus }[];
  }) {
    if (
      order.status === OrderStatus.cancelled ||
      order.status === OrderStatus.refunded ||
      order.status === OrderStatus.expired ||
      order.status === OrderStatus.paid
    ) {
      throw new BadRequestException('This order cannot be paid.');
    }

    if (order.payments.some((payment) => payment.status === PaymentStatus.paid || payment.status === PaymentStatus.approved)) {
      throw new BadRequestException('This order is already paid.');
    }

    if (order.reservationExpiresAt && order.reservationExpiresAt <= new Date()) {
      throw new BadRequestException('The stock reservation has expired.');
    }
  }
}
