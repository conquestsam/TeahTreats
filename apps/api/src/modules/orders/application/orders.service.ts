import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import {
  InventoryAdjustmentType,
  OrderStatus,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { OrderPolicy } from '../domain/order-policy.js';

const orderInclude = {
  items: true,
  payments: {
    orderBy: { createdAt: 'desc' as const }
  },
  history: {
    orderBy: { createdAt: 'desc' as const }
  },
  reservations: {
    include: {
      batch: {
        include: {
          sku: true
        }
      }
    },
    orderBy: { createdAt: 'asc' as const }
  }
} as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdminOrders(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const orders = await this.prisma.order.findMany({
      where: { tenantId: resolvedTenantId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return orders.map((order) => this.toOrderListItem(order));
  }

  async getAdminOrder(tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    return this.toOrderDetail(await this.findOrder(resolvedTenantId, orderId));
  }

  async listCustomerOrders(user: AuthenticatedUser, tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId: resolvedTenantId,
        userId: user.id
      },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return orders.map((order) => this.toOrderListItem(order));
  }

  async getCustomerOrder(user: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    return this.toOrderDetail(await this.findCustomerOrder(resolvedTenantId, user.id, orderId));
  }

  async markPreparing(actor: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);
    OrderPolicy.ensureCanMarkPreparing(order.status);

    const updated = await this.changeStatus({
      tenantId: resolvedTenantId,
      actorId: actor.id,
      orderId,
      status: OrderStatus.preparing,
      reason: 'Order preparation started.',
      eventName: domainEvents.orderPreparing
    });

    return this.toOrderDetail(updated);
  }

  async markReady(actor: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);
    OrderPolicy.ensureCanMarkReady(order.status);

    const updated = await this.changeStatus({
      tenantId: resolvedTenantId,
      actorId: actor.id,
      orderId,
      status: OrderStatus.ready_for_pickup,
      reason: 'Order is ready.',
      eventName: domainEvents.orderReadyForPickup,
      payload: {
        notify: ['customer.email', 'customer.sms', 'customer.whatsapp'],
        sideEffects: ['sse.order.status.changed']
      }
    });

    await this.sendReadyNotification(updated);
    return this.toOrderDetail(updated);
  }

  async markCompleted(actor: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);
    OrderPolicy.ensureCanMarkCompleted(order.status);

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.consumeReservations(tx, resolvedTenantId, orderId, actor.id);
      return this.writeStatusChange(tx, {
        tenantId: resolvedTenantId,
        actorId: actor.id,
        orderId,
        status: OrderStatus.completed,
        reason: 'Order completed by admin.',
        eventName: domainEvents.orderCompleted
      });
    });

    return this.toOrderDetail(updated);
  }

  async completeByCustomer(tenantId: string, orderId: string, input: { email: string; phone: string }) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);
    OrderPolicy.ensureCustomerMatches(order.customer, input);
    OrderPolicy.ensureCanMarkCompleted(order.status);

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.consumeReservations(tx, resolvedTenantId, orderId, null);
      return this.writeStatusChange(tx, {
        tenantId: resolvedTenantId,
        actorId: null,
        orderId,
        status: OrderStatus.completed,
        reason: 'Order completed by customer.',
        eventName: domainEvents.orderCompleted
      });
    });

    return this.toOrderDetail(updated);
  }

  async completeByAuthenticatedCustomer(user: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findCustomerOrder(resolvedTenantId, user.id, orderId);
    OrderPolicy.ensureCanMarkCompleted(order.status);

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.consumeReservations(tx, resolvedTenantId, orderId, user.id);
      return this.writeStatusChange(tx, {
        tenantId: resolvedTenantId,
        actorId: user.id,
        orderId,
        status: OrderStatus.completed,
        reason: 'Order completed by customer.',
        eventName: domainEvents.customerOrderCompleted
      });
    });

    return this.toOrderDetail(updated);
  }

  async cancel(actor: AuthenticatedUser, tenantId: string, orderId: string, reason: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);
    OrderPolicy.ensureCanCancel(order.status);

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.releaseReservations(tx, resolvedTenantId, orderId, actor.id, `Order cancelled: ${reason.trim()}`);
      return this.writeStatusChange(tx, {
        tenantId: resolvedTenantId,
        actorId: actor.id,
        orderId,
        status: OrderStatus.cancelled,
        reason: reason.trim(),
        eventName: domainEvents.orderCancelled,
        payload: { notify: ['customer.email', 'customer.sms'] }
      });
    });

    return this.toOrderDetail(updated);
  }

  async expireUnpaidReservations(limit = 50) {
    const orders = await this.prisma.order.findMany({
      where: {
        reservationExpiresAt: { lte: new Date() },
        status: {
          in: [
            OrderStatus.inventory_reserved,
            OrderStatus.payment_pending,
            OrderStatus.manual_payment_proof_submitted,
            OrderStatus.awaiting_admin_payment_approval,
            OrderStatus.payment_failed
          ]
        }
      },
      take: limit,
      orderBy: { reservationExpiresAt: 'asc' }
    });

    let expired = 0;
    for (const order of orders) {
      await this.prisma.$transaction(async (tx) => {
        await this.releaseReservations(tx, order.tenantId, order.id, null, 'Reservation expired.');
        await this.writeStatusChange(tx, {
          tenantId: order.tenantId,
          actorId: null,
          orderId: order.id,
          status: OrderStatus.expired,
          reason: 'Reservation expired.',
          eventName: domainEvents.orderExpired,
          payload: { sideEffects: ['inventory.release', 'sse.order.status.changed'] }
        });
      });
      expired += 1;
    }

    return { expired };
  }

  private async findOrder(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: orderInclude
    });
    if (!order) {
      throw new NotFoundException('Order was not found.');
    }
    return order;
  }

  private async findCustomerOrder(tenantId: string, userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, userId },
      include: orderInclude
    });
    if (!order) {
      throw new NotFoundException('Order was not found.');
    }
    return order;
  }

  private async changeStatus(input: {
    tenantId: string;
    actorId: string;
    orderId: string;
    status: OrderStatus;
    reason: string;
    eventName: (typeof domainEvents)[keyof typeof domainEvents];
    payload?: Record<string, unknown>;
  }) {
    return this.prisma.$transaction((tx) =>
      this.writeStatusChange(tx, input),
    );
  }

  private async writeStatusChange(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      actorId: string | null;
      orderId: string;
      status: OrderStatus;
      reason: string;
      eventName: (typeof domainEvents)[keyof typeof domainEvents];
      payload?: Record<string, unknown>;
    },
  ) {
    const updated = await tx.order.update({
      where: { id: input.orderId },
      data: { status: input.status },
      include: orderInclude
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        status: input.status,
        ...(input.actorId ? { actorId: input.actorId } : {}),
        reason: input.reason
      }
    });
    await tx.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId,
        action: 'order.status-changed',
        target: input.orderId,
        metadata: {
          orderId: input.orderId,
          status: input.status,
          reason: input.reason
        }
      }
    });
    await this.writeOutbox(tx, input.tenantId, input.orderId, input.eventName, {
      orderId: input.orderId,
      status: input.status,
      reason: input.reason,
      ...(input.payload ?? {})
    });
    await this.writeOutbox(tx, input.tenantId, input.orderId, domainEvents.orderStatusChanged, {
      orderId: input.orderId,
      status: input.status,
      sideEffects: ['sse.order.status.changed']
    });
    return updated;
  }

  private async releaseReservations(
    tx: Prisma.TransactionClient,
    tenantId: string,
    orderId: string,
    actorId: string | null,
    reason: string,
  ) {
    const reservations = await tx.inventoryReservation.findMany({
      where: { tenantId, orderId, committed: false, releasedAt: null },
      include: { batch: true }
    });

    for (const reservation of reservations) {
      const updated = await tx.inventoryBatch.updateMany({
        where: {
          id: reservation.batchId,
          reserved: { gte: reservation.quantity }
        },
        data: { reserved: { decrement: reservation.quantity } }
      });
      if (updated.count === 0) {
        throw new BadRequestException('Reserved inventory could not be released.');
      }
      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: { committed: true, releasedAt: new Date() }
      });
      await tx.inventoryAdjustment.create({
        data: {
          batchId: reservation.batchId,
          tenantId,
          skuId: reservation.batch.skuId,
          ...(actorId ? { actorId } : {}),
          type: InventoryAdjustmentType.release,
          quantityDelta: 0,
          reason
        }
      });
      await this.writeOutbox(tx, tenantId, reservation.id, domainEvents.inventoryReservationReleased, {
        reservationId: reservation.id,
        orderId,
        batchId: reservation.batchId,
        quantity: reservation.quantity
      });
    }
  }

  private async consumeReservations(
    tx: Prisma.TransactionClient,
    tenantId: string,
    orderId: string,
    actorId: string | null,
  ) {
    const reservations = await tx.inventoryReservation.findMany({
      where: { tenantId, orderId, committed: false, releasedAt: null },
      include: { batch: true }
    });

    for (const reservation of reservations) {
      const updated = await tx.inventoryBatch.updateMany({
        where: {
          id: reservation.batchId,
          quantity: { gte: reservation.quantity },
          reserved: { gte: reservation.quantity }
        },
        data: {
          quantity: { decrement: reservation.quantity },
          reserved: { decrement: reservation.quantity }
        }
      });
      if (updated.count === 0) {
        throw new BadRequestException('Reserved inventory could not be completed.');
      }
      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: { committed: true }
      });
      await tx.inventoryAdjustment.create({
        data: {
          batchId: reservation.batchId,
          tenantId,
          skuId: reservation.batch.skuId,
          ...(actorId ? { actorId } : {}),
          type: InventoryAdjustmentType.decrease,
          quantityDelta: -reservation.quantity,
          reason: `Order completed: ${orderId}`
        }
      });
    }
  }

  private async sendReadyNotification(order: OrderWithDetails) {
    const customer = this.readCustomer(order.customer);
    const subject = 'Your snacks order is ready';
    const body = `Your order ${order.id} is ready.`;

    await this.prisma.notification.createMany({
      data: [
        {
          tenantId: order.tenantId,
          channel: 'email',
          subject,
          body,
          status: customer.email ? 'pending' : 'skipped',
          metadata: { to: customer.email, orderId: order.id }
        },
        {
          tenantId: order.tenantId,
          channel: 'sms',
          subject,
          body,
          status: customer.phone ? 'pending' : 'skipped',
          metadata: { to: customer.phone, orderId: order.id }
        },
        {
          tenantId: order.tenantId,
          channel: 'whatsapp',
          subject,
          body,
          status: customer.phone ? 'pending' : 'skipped',
          metadata: { to: customer.phone, orderId: order.id }
        }
      ]
    });
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    if (!tenantIdOrSlug) {
      throw new BadRequestException('Tenant context is required.');
    }
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant.id;
  }

  private writeOutbox(
    tx: Prisma.TransactionClient,
    tenantId: string,
    aggregateId: string,
    name: (typeof domainEvents)[keyof typeof domainEvents],
    payload: Record<string, unknown>,
  ) {
    return tx.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId,
        name,
        payload: payload as Prisma.InputJsonValue
      }
    });
  }

  private readCustomer(customerValue: Prisma.JsonValue) {
    const customer =
      customerValue && typeof customerValue === 'object' && !Array.isArray(customerValue)
        ? (customerValue as Record<string, unknown>)
        : {};

    return {
      name: typeof customer.name === 'string' ? customer.name : 'Customer',
      email: typeof customer.email === 'string' ? customer.email : '',
      phone: typeof customer.phone === 'string' ? customer.phone : '',
      address: typeof customer.address === 'string' ? customer.address : ''
    };
  }

  private toOrderListItem(order: Prisma.OrderGetPayload<{ include: { items: true; payments: true } }>) {
    const customer = this.readCustomer(order.customer);
    return {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      paymentStatus: order.payments[0]?.status ?? null,
      reservationExpiresAt: order.reservationExpiresAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }

  private toOrderDetail(order: OrderWithDetails) {
    const customer = this.readCustomer(order.customer);
    return {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      customer,
      reservationExpiresAt: order.reservationExpiresAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        skuId: item.skuId,
        productName: item.productName,
        skuName: item.skuName,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        lineTotalCents: item.lineTotalCents
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        amountCents: payment.amountCents,
        currency: payment.currency,
        createdAt: payment.createdAt.toISOString()
      })),
      history: order.history.map((history) => ({
        id: history.id,
        status: history.status,
        reason: history.reason,
        actorId: history.actorId,
        createdAt: history.createdAt.toISOString()
      })),
      reservations: order.reservations.map((reservation) => ({
        id: reservation.id,
        batchId: reservation.batchId,
        skuId: reservation.batch.skuId,
        quantity: reservation.quantity,
        expiresAt: reservation.expiresAt.toISOString(),
        committed: reservation.committed
      }))
    };
  }
}

type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
