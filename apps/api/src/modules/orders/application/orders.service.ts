import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { adminOrderStatusLabels, domainEvents } from '@snacks/shared';
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
  items: {
    include: {
      sku: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' as const }, take: 1 }
            }
          }
        }
      }
    }
  },
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

const orderListInclude = {
  items: {
    include: {
      sku: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' as const }, take: 1 }
            }
          }
        }
      }
    }
  },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    take: 1
  }
} as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdminOrders(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const orders = await this.prisma.order.findMany({
      where: { tenantId: resolvedTenantId },
      include: orderListInclude,
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
      include: orderListInclude,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return orders.map((order) => this.toOrderListItem(order));
  }

  async getCustomerOrder(user: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    return this.toOrderDetail(await this.findCustomerOrder(resolvedTenantId, user.id, orderId));
  }

  async lookupCustomerOrder(tenantId: string, orderId: string, input: { email: string; phone: string }) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);
    OrderPolicy.ensureCustomerMatches(order.customer, input);
    return this.toOrderDetail(order);
  }

  async claimGuestOrder(user: AuthenticatedUser, tenantId: string, orderId: string, input: { email: string; phone: string }) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findOrder(resolvedTenantId, orderId);

    if (order.userId && order.userId !== user.id) {
      throw new BadRequestException('This order is already saved to another account.');
    }

    if (order.userId === user.id && order.checkoutMode === 'account') {
      return this.toOrderDetail(order);
    }

    OrderPolicy.ensureCustomerMatches(order.customer, input);
    if (user.email.trim().toLowerCase() !== input.email.trim().toLowerCase()) {
      throw new BadRequestException('Sign in with the same email used at checkout to save this order.');
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        userId: user.id,
        checkoutMode: 'account'
      },
      include: orderInclude
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: resolvedTenantId,
        actorId: user.id,
        action: 'customer.order-claimed',
        target: order.id,
        metadata: {
          orderId: order.id,
          checkoutModeBefore: order.checkoutMode,
          customerEmail: input.email
        }
      }
    }).catch(() => null);
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId: resolvedTenantId,
        aggregateId: order.id,
        name: domainEvents.customerOrderClaimed,
        payload: {
          orderId: order.id,
          userId: user.id,
          email: user.email,
          sideEffects: ['customer.orders.invalidate']
        }
      }
    }).catch(() => null);

    return this.toOrderDetail(updated);
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
    const fulfillmentMethod = customer.fulfillmentMethod;

    return {
      name: typeof customer.name === 'string' ? customer.name : 'Customer',
      email: typeof customer.email === 'string' ? customer.email : '',
      phone: typeof customer.phone === 'string' ? customer.phone : '',
      address: this.formatCustomerAddress(customer.address),
      fulfillmentMethod: fulfillmentMethod === 'delivery_handoff' || fulfillmentMethod === 'store_pickup' || fulfillmentMethod === 'scheduled_delivery'
        ? fulfillmentMethod
        : undefined,
      recipientName: this.optionalCustomerString(customer.recipientName),
      addressLine1: this.optionalCustomerString(customer.addressLine1),
      addressLine2: this.optionalCustomerString(customer.addressLine2),
      city: this.optionalCustomerString(customer.city),
      state: this.optionalCustomerString(customer.state),
      postalCode: this.optionalCustomerString(customer.postalCode),
      handoffInstructions: this.optionalCustomerString(customer.handoffInstructions),
      deliveryDate: this.optionalCustomerString(customer.deliveryDate),
      deliveryWindow: this.optionalCustomerString(customer.deliveryWindow),
      deliverySlotId: this.optionalCustomerString(customer.deliverySlotId),
      deliverySlotSnapshot: this.readDeliverySlotSnapshot(customer.deliverySlotSnapshot),
      deliveryWindowLabel: this.optionalCustomerString(customer.deliveryWindowLabel)
    };
  }

  private readDeliverySlotSnapshot(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    const record = value as Record<string, unknown>;
    const method = record.method;
    if (
      typeof record.id !== 'string' ||
      typeof record.label !== 'string' ||
      (method !== 'delivery_handoff' && method !== 'store_pickup' && method !== 'scheduled_delivery') ||
      typeof record.startTime !== 'string' ||
      typeof record.endTime !== 'string' ||
      typeof record.feeCents !== 'number' ||
      typeof record.capacity !== 'number' ||
      typeof record.cutoffTime !== 'string'
    ) {
      return undefined;
    }

    return {
      id: record.id,
      label: record.label,
      method,
      startTime: record.startTime,
      endTime: record.endTime,
      feeCents: record.feeCents,
      capacity: record.capacity,
      cutoffTime: record.cutoffTime,
      hubId: this.optionalCustomerString(record.hubId) ?? null,
      storeId: this.optionalCustomerString(record.storeId) ?? null
    };
  }

  private optionalCustomerString(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private formatCustomerAddress(value: unknown) {
    if (typeof value === 'string') {
      return value;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return '';
    }
    const address = value as Record<string, unknown>;
    return ['line1', 'line2', 'city', 'state', 'postalCode', 'zip', 'country']
      .map((key) => address[key])
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(', ');
  }

  private toOrderListItem(order: Prisma.OrderGetPayload<{ include: typeof orderListInclude }>) {
    const customer = this.readCustomer(order.customer);
    const paymentStatus = order.payments[0]?.status ?? null;

    return {
      id: order.id,
      shortRef: this.shortRef(order.id),
      checkoutMode: order.checkoutMode === 'account' ? 'account' : 'guest',
      isGuestCheckout: order.checkoutMode !== 'account',
      status: order.status,
      statusLabel: adminOrderStatusLabels[order.status],
      totalCents: order.totalCents,
      currency: order.currency,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerSummary: this.customerSummary(customer),
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      itemPreview: order.items.slice(0, 3).map((item) => ({
        productName: item.productName,
        skuName: item.skuName,
        quantity: item.quantity,
        imageUrl: this.itemImageUrl(item)
      })),
      paymentStatus,
      paymentStatusLabel: paymentStatus ? this.readableLabel(paymentStatus) : null,
      reservationExpiresAt: order.reservationExpiresAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }

  private toOrderDetail(order: OrderWithDetails) {
    const customer = this.readCustomer(order.customer);
    const paymentStatus = order.payments[0]?.status ?? null;

    return {
      id: order.id,
      shortRef: this.shortRef(order.id),
      checkoutMode: order.checkoutMode === 'account' ? 'account' : 'guest',
      isGuestCheckout: order.checkoutMode !== 'account',
      status: order.status,
      statusLabel: adminOrderStatusLabels[order.status],
      totalCents: order.totalCents,
      currency: order.currency,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerSummary: this.customerSummary(customer),
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      itemPreview: order.items.slice(0, 3).map((item) => ({
        productName: item.productName,
        skuName: item.skuName,
        quantity: item.quantity,
        imageUrl: this.itemImageUrl(item)
      })),
      paymentStatus,
      paymentStatusLabel: paymentStatus ? this.readableLabel(paymentStatus) : null,
      customer,
      reservationExpiresAt: order.reservationExpiresAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        skuId: item.skuId,
        productName: item.productName,
        skuName: item.skuName,
        imageUrl: this.itemImageUrl(item),
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
        label: adminOrderStatusLabels[history.status],
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

  private shortRef(id: string) {
    return `TT-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  }

  private readableLabel(value: string) {
    return value
      .split('_')
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
  }

  private customerSummary(customer: { name: string; email: string; phone: string; address: string }) {
    return [customer.phone, customer.address].filter(Boolean).join(' • ');
  }

  private itemImageUrl(item: { sku: { product: { images: Array<{ url: string }> } } | null }) {
    return item.sku?.product.images[0]?.url ?? null;
  }
}

type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
