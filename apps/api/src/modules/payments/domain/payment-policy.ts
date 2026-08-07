import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class PaymentPolicy {
  static ensureCustomerMatches(orderCustomer: unknown, input: { email: string; phone: string }) {
    if (!orderCustomer || typeof orderCustomer !== 'object' || Array.isArray(orderCustomer)) {
      throw new ForbiddenException('Order verification failed.');
    }

    const customer = orderCustomer as Record<string, unknown>;
    if (
      String(customer.email).toLowerCase() !== input.email.toLowerCase() ||
      String(customer.phone) !== input.phone
    ) {
      throw new ForbiddenException('Order verification failed.');
    }
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
