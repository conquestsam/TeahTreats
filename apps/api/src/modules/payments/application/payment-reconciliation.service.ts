import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import {
  InventoryAdjustmentType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

type ReconciliationOutcome = 'succeeded' | 'failed' | 'refunded';

interface ProviderReconciliationInput {
  provider: PaymentProvider;
  eventId: string;
  eventType: string;
  providerRef?: string | null;
  orderId?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  payload: Record<string, unknown>;
}

interface ManualReconciliationInput {
  tenantId: string;
  paymentId: string;
  proofId: string;
  actorId: string;
  reason?: string;
}

const terminalOrderStatuses = new Set<OrderStatus>([
  OrderStatus.paid,
  OrderStatus.preparing,
  OrderStatus.ready_for_pickup,
  OrderStatus.ready_for_pickup_dispatch,
  OrderStatus.completed,
  OrderStatus.refunded,
  OrderStatus.partially_refunded
]);
const closedOrderStatuses = new Set<OrderStatus>([
  OrderStatus.payment_failed,
  OrderStatus.cancelled,
  OrderStatus.expired,
  OrderStatus.refunded
]);

@Injectable()
export class PaymentReconciliationService {
  constructor(private readonly prisma: PrismaService) {}

  async reconcileProviderSuccess(input: ProviderReconciliationInput) {
    return this.reconcileProviderEvent(input, 'succeeded');
  }

  async reconcileProviderFailure(input: ProviderReconciliationInput) {
    return this.reconcileProviderEvent(input, 'failed');
  }

  async recordRefundPlaceholder(input: ProviderReconciliationInput) {
    return this.reconcileProviderEvent(input, 'refunded');
  }

  async approveManualPayment(input: ManualReconciliationInput) {
    const payment = await this.findPaymentById(input.tenantId, input.paymentId);
    if (payment.provider !== PaymentProvider.manual) {
      throw new BadRequestException('Only manual payments can be approved from a manual proof.');
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.paid,
          reconciliationStatus: 'reconciled',
          reconciledAt: new Date(),
          lastProviderEventId: input.proofId,
          metadata: this.mergeMetadata(payment.metadata, {
            manualProofId: input.proofId,
            reconciledBy: input.actorId,
            reconciledFrom: 'manual-proof-approval'
          })
        },
        include: { order: true }
      });
      await this.markOrderPaid(tx, updatedPayment.tenantId, updatedPayment.orderId, input.actorId, 'Manual payment approved.');
      await this.writePaymentSideEffects(tx, updatedPayment.tenantId, updatedPayment.id, updatedPayment.orderId, input.actorId, {
        auditAction: 'payment.manual-proof-approved',
        eventName: domainEvents.manualProofApproved,
        payload: { proofId: input.proofId, paymentId: updatedPayment.id, orderId: updatedPayment.orderId }
      });
      await this.writeOutbox(tx, updatedPayment.tenantId, updatedPayment.id, domainEvents.paymentReconciled, {
        paymentId: updatedPayment.id,
        orderId: updatedPayment.orderId,
        provider: updatedPayment.provider,
        source: 'manual-proof'
      });
      await this.createPaymentNotifications(tx, updatedPayment.tenantId, updatedPayment.orderId, 'Payment approved', 'Your payment was approved.');
      return this.toPaymentSummary(updatedPayment);
    });
  }

  async rejectManualPayment(input: ManualReconciliationInput) {
    const payment = await this.findPaymentById(input.tenantId, input.paymentId);
    if (payment.provider !== PaymentProvider.manual) {
      throw new BadRequestException('Only manual payments can be rejected from a manual proof.');
    }
    const reason = input.reason?.trim() || 'Manual payment rejected.';
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.failed,
          reconciliationStatus: 'failed',
          reconciledAt: new Date(),
          lastProviderEventId: input.proofId,
          metadata: this.mergeMetadata(payment.metadata, {
            manualProofId: input.proofId,
            reconciledBy: input.actorId,
            reconciledFrom: 'manual-proof-rejection',
            reason
          })
        },
        include: { order: true }
      });
      await this.markOrderPaymentFailed(tx, updatedPayment.tenantId, updatedPayment.orderId, input.actorId, reason);
      await this.releaseReservations(tx, updatedPayment.tenantId, updatedPayment.orderId, input.actorId, reason);
      await this.writePaymentSideEffects(tx, updatedPayment.tenantId, updatedPayment.id, updatedPayment.orderId, input.actorId, {
        auditAction: 'payment.manual-proof-rejected',
        eventName: domainEvents.manualProofRejected,
        payload: { proofId: input.proofId, paymentId: updatedPayment.id, orderId: updatedPayment.orderId, reason }
      });
      await this.writeOutbox(tx, updatedPayment.tenantId, updatedPayment.orderId, domainEvents.orderPaymentFailed, {
        orderId: updatedPayment.orderId,
        reason
      });
      await this.createPaymentNotifications(tx, updatedPayment.tenantId, updatedPayment.orderId, 'Payment rejected', 'Your payment was rejected.');
      return this.toPaymentSummary(updatedPayment);
    });
  }

  async getCustomerPaymentStatus(tenantIdOrSlug: string, orderId: string, verification: { email: string; phone: string }) {
    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    if (!order) {
      throw new NotFoundException('Order was not found.');
    }
    const customer = this.readCustomer(order.customer);
    if (customer.email.toLowerCase() !== verification.email.trim().toLowerCase() || customer.phone !== verification.phone.trim()) {
      throw new NotFoundException('Order was not found.');
    }
    const payment = order.payments[0];
    if (!payment) {
      return {
        orderId: order.id,
        orderStatus: order.status,
        status: 'not_started',
        provider: null,
        amountCents: order.totalCents,
        currency: order.currency,
        reconciliationStatus: 'pending',
        reconciledAt: null,
        lastProviderEventId: null
      };
    }
    return this.toPaymentSummary({ ...payment, order });
  }

  private async reconcileProviderEvent(input: ProviderReconciliationInput, outcome: ReconciliationOutcome) {
    const existingEvent = await this.findOrCreateProviderEvent(input);
    if (existingEvent.processedAt) {
      return {
        id: existingEvent.id,
        provider: existingEvent.provider,
        eventId: existingEvent.eventId,
        eventType: existingEvent.eventType,
        status: existingEvent.status,
        processedAt: existingEvent.processedAt.toISOString(),
        duplicate: true
      };
    }
    const claimed = await this.prisma.paymentProviderEvent.updateMany({
      where: { id: existingEvent.id, status: 'received', processedAt: null },
      data: { status: 'processing' }
    });
    if (claimed.count === 0) {
      return {
        id: existingEvent.id,
        provider: existingEvent.provider,
        eventId: existingEvent.eventId,
        eventType: existingEvent.eventType,
        status: existingEvent.status,
        duplicate: true
      };
    }

    const payment = await this.findProviderPayment(input);
    if (!payment) {
      await this.markUnmatchedProviderEvent(existingEvent.id, input);
      return { id: existingEvent.id, status: 'attention_required', reason: 'payment_not_found' };
    }

    const mismatch = this.findPaymentMismatch(payment, input);
    if (mismatch) {
      await this.markAttentionRequired(existingEvent.id, payment, input, mismatch);
      return { id: existingEvent.id, status: 'attention_required', reason: mismatch };
    }

    const stateConflict = this.findStateConflict(payment.order.status, outcome);
    if (stateConflict) {
      await this.markAttentionRequired(existingEvent.id, payment, input, stateConflict);
      return { id: existingEvent.id, status: 'attention_required', reason: stateConflict };
    }

    return this.prisma.$transaction(async (tx) => {
      if (outcome === 'succeeded') {
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.paid,
            reconciliationStatus: 'reconciled',
            reconciledAt: new Date(),
            lastProviderEventId: input.eventId,
            metadata: this.mergeMetadata(payment.metadata, {
              providerEventId: input.eventId,
              providerEventType: input.eventType,
              providerRef: input.providerRef ?? payment.providerRef
            })
          },
          include: { order: true }
        });
        await tx.paymentProviderEvent.update({
          where: { id: existingEvent.id },
          data: {
            tenantId: payment.tenantId,
            paymentId: payment.id,
            orderId: payment.orderId,
            status: 'processed',
            processedAt: new Date()
          }
        });
        await this.markOrderPaid(tx, payment.tenantId, payment.orderId, null, `${input.provider} payment confirmed.`);
        await this.writeOutbox(tx, payment.tenantId, payment.id, domainEvents.paymentSucceeded, {
          paymentId: payment.id,
          orderId: payment.orderId,
          provider: input.provider,
          eventId: input.eventId
        });
        await this.writeOutbox(tx, payment.tenantId, payment.id, domainEvents.paymentReconciled, {
          paymentId: payment.id,
          orderId: payment.orderId,
          provider: input.provider,
          eventId: input.eventId
        });
        await this.writeAudit(tx, payment.tenantId, null, 'payment.provider-succeeded', payment.id, {
          eventId: input.eventId,
          eventType: input.eventType
        });
        await this.createPaymentNotifications(tx, payment.tenantId, payment.orderId, 'Payment received', 'Your payment was received.');
        return this.toPaymentSummary(updatedPayment);
      }

      if (outcome === 'failed') {
        const reason = `${input.provider} reported payment failure.`;
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.failed,
            reconciliationStatus: 'failed',
            reconciledAt: new Date(),
            lastProviderEventId: input.eventId,
            metadata: this.mergeMetadata(payment.metadata, {
              providerEventId: input.eventId,
              providerEventType: input.eventType,
              failureReason: reason
            })
          },
          include: { order: true }
        });
        await tx.paymentProviderEvent.update({
          where: { id: existingEvent.id },
          data: {
            tenantId: payment.tenantId,
            paymentId: payment.id,
            orderId: payment.orderId,
            status: 'processed',
            processedAt: new Date()
          }
        });
        await this.markOrderPaymentFailed(tx, payment.tenantId, payment.orderId, null, reason);
        await this.releaseReservations(tx, payment.tenantId, payment.orderId, null, reason);
        await this.writeOutbox(tx, payment.tenantId, payment.id, domainEvents.paymentFailed, {
          paymentId: payment.id,
          orderId: payment.orderId,
          provider: input.provider,
          eventId: input.eventId,
          reason
        });
        await this.writeOutbox(tx, payment.tenantId, payment.orderId, domainEvents.orderPaymentFailed, {
          orderId: payment.orderId,
          reason
        });
        await this.writeAudit(tx, payment.tenantId, null, 'payment.provider-failed', payment.id, {
          eventId: input.eventId,
          eventType: input.eventType
        });
        await this.createPaymentNotifications(tx, payment.tenantId, payment.orderId, 'Payment failed', 'Your payment could not be confirmed.');
        return this.toPaymentSummary(updatedPayment);
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          reconciliationStatus: 'refund_pending',
          lastProviderEventId: input.eventId,
          metadata: this.mergeMetadata(payment.metadata, {
            refundEventId: input.eventId,
            refundEventType: input.eventType,
            refundPlaceholder: true
          })
        }
      });
      await tx.paymentProviderEvent.update({
        where: { id: existingEvent.id },
        data: {
          tenantId: payment.tenantId,
          paymentId: payment.id,
          orderId: payment.orderId,
          status: 'processed',
          processedAt: new Date()
        }
      });
      await this.writeOutbox(tx, payment.tenantId, payment.id, domainEvents.paymentRefunded, {
        paymentId: payment.id,
        orderId: payment.orderId,
        provider: input.provider,
        eventId: input.eventId,
        placeholder: true
      });
      await this.writeAudit(tx, payment.tenantId, null, 'payment.provider-refund-placeholder', payment.id, {
        eventId: input.eventId,
        eventType: input.eventType
      });
      return { id: payment.id, orderId: payment.orderId, status: 'refund_pending' };
    });
  }

  private async findOrCreateProviderEvent(input: ProviderReconciliationInput) {
    try {
      return await this.prisma.paymentProviderEvent.create({
        data: {
          provider: input.provider,
          eventId: input.eventId,
          eventType: input.eventType,
          payload: input.payload as Prisma.InputJsonValue
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return this.prisma.paymentProviderEvent.findUniqueOrThrow({
          where: { provider_eventId: { provider: input.provider, eventId: input.eventId } }
        });
      }
      throw error;
    }
  }

  private async findProviderPayment(input: ProviderReconciliationInput) {
    if (input.providerRef) {
      const payment = await this.prisma.payment.findFirst({
        where: { provider: input.provider, providerRef: input.providerRef },
        include: { order: true }
      });
      if (payment) {
        return payment;
      }
    }

    if (input.orderId) {
      return this.prisma.payment.findFirst({
        where: { provider: input.provider, orderId: input.orderId },
        orderBy: { createdAt: 'desc' },
        include: { order: true }
      });
    }

    return null;
  }

  private async findPaymentById(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { order: true }
    });
    if (!payment) {
      throw new NotFoundException('Payment was not found.');
    }
    return payment;
  }

  private findPaymentMismatch(
    payment: { amountCents: number; currency: string },
    input: Pick<ProviderReconciliationInput, 'amountCents' | 'currency'>,
  ) {
    if (typeof input.amountCents === 'number' && input.amountCents !== payment.amountCents) {
      return 'provider_amount_mismatch';
    }
    if (input.currency && input.currency.toUpperCase() !== payment.currency.toUpperCase()) {
      return 'provider_currency_mismatch';
    }
    return null;
  }

  private findStateConflict(orderStatus: OrderStatus, outcome: ReconciliationOutcome) {
    if (outcome === 'succeeded' && closedOrderStatuses.has(orderStatus)) {
      return 'provider_success_after_order_closed';
    }
    if (outcome === 'failed' && terminalOrderStatuses.has(orderStatus)) {
      return 'provider_failure_after_order_progressed';
    }
    return null;
  }

  private async markAttentionRequired(
    providerEventId: string,
    payment: {
      id: string;
      tenantId: string;
      orderId: string;
      metadata: Prisma.JsonValue;
    },
    input: Pick<ProviderReconciliationInput, 'eventId' | 'eventType' | 'provider'>,
    reason: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentProviderEvent.update({
        where: { id: providerEventId },
        data: {
          tenantId: payment.tenantId,
          paymentId: payment.id,
          orderId: payment.orderId,
          status: 'attention_required',
          error: reason,
          processedAt: new Date()
        }
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          reconciliationStatus: 'attention_required',
          lastProviderEventId: input.eventId,
          metadata: this.mergeMetadata(payment.metadata, { reconciliationError: reason })
        }
      });
      await this.writeAudit(tx, payment.tenantId, null, 'payment.provider-event-attention-required', payment.id, {
        eventId: input.eventId,
        eventType: input.eventType,
        reason
      });
      await this.writeOutbox(tx, payment.tenantId, payment.id, domainEvents.paymentRequiresAttention, {
        paymentId: payment.id,
        orderId: payment.orderId,
        provider: input.provider,
        eventId: input.eventId,
        reason
      });
    });
  }

  private async markUnmatchedProviderEvent(providerEventId: string, input: ProviderReconciliationInput) {
    const order = input.orderId
      ? await this.prisma.order.findUnique({ where: { id: input.orderId } })
      : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentProviderEvent.update({
        where: { id: providerEventId },
        data: {
          ...(order ? { tenantId: order.tenantId, orderId: order.id } : {}),
          status: 'attention_required',
          error: 'Matching payment was not found.',
          processedAt: new Date()
        }
      });

      if (!order) {
        return;
      }

      await this.writeAudit(tx, order.tenantId, null, 'payment.provider-event-unmatched', providerEventId, {
        eventId: input.eventId,
        eventType: input.eventType,
        provider: input.provider,
        orderId: order.id
      });
      await this.writeOutbox(tx, order.tenantId, providerEventId, domainEvents.paymentRequiresAttention, {
        orderId: order.id,
        provider: input.provider,
        eventId: input.eventId,
        reason: 'payment_not_found'
      });
      const tenant = await tx.tenant.findUnique({ where: { id: order.tenantId } });
      await tx.notification.create({
        data: {
          tenantId: order.tenantId,
          channel: 'email',
          recipient: tenant?.businessEmail ?? null,
          subject: 'Payment needs review',
          body: `A ${input.provider} webhook could not be matched to a payment for order ${order.id}.`,
          status: tenant?.businessEmail ? 'pending' : 'skipped',
          lastError: tenant?.businessEmail ? null : 'Recipient is missing.',
          metadata: { to: tenant?.businessEmail ?? null, orderId: order.id, provider: input.provider, eventId: input.eventId }
        }
      });
    });
  }

  private async markOrderPaid(
    tx: Prisma.TransactionClient,
    tenantId: string,
    orderId: string,
    actorId: string | null,
    reason: string,
  ) {
    const order = await tx.order.findFirst({ where: { id: orderId, tenantId } });
    if (!order || terminalOrderStatuses.has(order.status)) {
      return;
    }
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.paid } });
    await tx.orderStatusHistory.create({
      data: { orderId, status: OrderStatus.paid, ...(actorId ? { actorId } : {}), reason }
    });
    await this.writeOutbox(tx, tenantId, orderId, domainEvents.orderPaid, { orderId });
  }

  private async markOrderPaymentFailed(
    tx: Prisma.TransactionClient,
    tenantId: string,
    orderId: string,
    actorId: string | null,
    reason: string,
  ) {
    const order = await tx.order.findFirst({ where: { id: orderId, tenantId } });
    if (!order || terminalOrderStatuses.has(order.status) || order.status === OrderStatus.cancelled || order.status === OrderStatus.expired) {
      return;
    }
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.payment_failed } });
    await tx.orderStatusHistory.create({
      data: { orderId, status: OrderStatus.payment_failed, ...(actorId ? { actorId } : {}), reason }
    });
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
        where: { id: reservation.batchId, reserved: { gte: reservation.quantity } },
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

  private async writePaymentSideEffects(
    tx: Prisma.TransactionClient,
    tenantId: string,
    paymentId: string,
    orderId: string,
    actorId: string | null,
    input: {
      auditAction: string;
      eventName: (typeof domainEvents)[keyof typeof domainEvents];
      payload: Record<string, unknown>;
    },
  ) {
    await this.writeAudit(tx, tenantId, actorId, input.auditAction, paymentId, {
      paymentId,
      orderId,
      ...input.payload
    });
    await this.writeOutbox(tx, tenantId, paymentId, input.eventName, input.payload);
  }

  private async createPaymentNotifications(
    tx: Prisma.TransactionClient,
    tenantId: string,
    orderId: string,
    subject: string,
    body: string,
  ) {
    const order = await tx.order.findFirst({ where: { id: orderId, tenantId } });
    const customer = order ? this.readCustomer(order.customer) : { email: '', phone: '' };
    await tx.notification.createMany({
      data: [
        {
          tenantId,
          channel: 'email',
          recipient: customer.email || null,
          subject,
          body: `${body} Order ${orderId}.`,
          status: customer.email ? 'pending' : 'skipped',
          lastError: customer.email ? null : 'Recipient is missing.',
          metadata: { to: customer.email || null, orderId }
        },
        {
          tenantId,
          channel: 'sms',
          recipient: customer.phone || null,
          subject,
          body: `${body} Order ${orderId}.`,
          status: customer.phone ? 'pending' : 'skipped',
          lastError: customer.phone ? null : 'Recipient is missing.',
          metadata: { to: customer.phone || null, orderId }
        }
      ]
    });
  }

  private mergeMetadata(current: Prisma.JsonValue, next: Record<string, unknown>) {
    const base = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
    return { ...base, ...next } as Prisma.InputJsonValue;
  }

  private readCustomer(value: Prisma.JsonValue) {
    const customer = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return {
      email: typeof customer.email === 'string' ? customer.email : '',
      phone: typeof customer.phone === 'string' ? customer.phone : ''
    };
  }

  private toPaymentSummary(payment: {
    id: string;
    orderId: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    amountCents: number;
    currency: string;
    providerRef: string | null;
    reconciliationStatus: string;
    reconciledAt: Date | null;
    lastProviderEventId: string | null;
    order?: { status: OrderStatus };
  }) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      providerRef: payment.providerRef,
      orderStatus: payment.order?.status,
      reconciliationStatus: payment.reconciliationStatus,
      reconciledAt: payment.reconciledAt?.toISOString() ?? null,
      lastProviderEventId: payment.lastProviderEventId
    };
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new BadRequestException('Tenant was not found.');
    }
    return tenant.id;
  }

  private async writeAudit(tx: Prisma.TransactionClient, tenantId: string, actorId: string | null, action: string, target: string, payload: Record<string, unknown>) {
    await tx.auditLog.create({
      data: {
        tenantId,
        actorId,
        action,
        target,
        metadata: payload as Prisma.InputJsonValue
      }
    });
  }

  private async writeOutbox(tx: Prisma.TransactionClient, tenantId: string, aggregateId: string, name: (typeof domainEvents)[keyof typeof domainEvents], payload: Record<string, unknown>) {
    await tx.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId,
        name,
        payload: payload as Prisma.InputJsonValue
      }
    });
  }
}
