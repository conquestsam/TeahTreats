import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import { InventoryAdjustmentType, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';

const proofInclude = {
  payment: {
    include: {
      order: true
    }
  },
  manualPaymentMethod: true
} as const;

@Injectable()
export class ManualPaymentReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async listPending(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const proofs = await this.prisma.manualPaymentProof.findMany({
      where: {
        reviewedAt: null,
        payment: {
          tenantId: resolvedTenantId,
          status: PaymentStatus.awaiting_admin_approval
        }
      },
      include: proofInclude,
      orderBy: { createdAt: 'desc' }
    });
    return proofs.map((proof) => this.toProofSummary(proof));
  }

  async approve(actor: AuthenticatedUser, tenantId: string, proofId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const proof = await this.findProof(resolvedTenantId, proofId);
    if (proof.payment.order.status !== OrderStatus.awaiting_admin_payment_approval) {
      throw new BadRequestException('This proof cannot be approved.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const reviewed = await tx.manualPaymentProof.update({
        where: { id: proof.id },
        data: {
          reviewedAt: new Date(),
          reviewedBy: actor.id
        },
        include: proofInclude
      });
      await tx.payment.update({
        where: { id: proof.paymentId },
        data: {
          status: PaymentStatus.paid,
          reconciliationStatus: 'reconciled',
          reconciledAt: new Date(),
          lastProviderEventId: proof.id,
          metadata: this.mergeMetadata(proof.payment.metadata, {
            reconciledFrom: 'manual-proof-approval',
            manualProofId: proof.id,
            reconciledBy: actor.id
          })
        }
      });
      await tx.order.update({
        where: { id: proof.payment.orderId },
        data: { status: OrderStatus.paid }
      });
      await tx.orderStatusHistory.create({
        data: { orderId: proof.payment.orderId, status: OrderStatus.paid, actorId: actor.id, reason: 'Manual payment approved.' }
      });
      await this.writeAudit(tx, resolvedTenantId, actor.id, 'payment.manual-proof-approved', proof.id, {
        proofId: proof.id,
        orderId: proof.payment.orderId
      });
      await this.writeOutbox(tx, resolvedTenantId, proof.id, domainEvents.manualProofApproved, {
        proofId: proof.id,
        orderId: proof.payment.orderId,
        notify: ['customer.email', 'customer.sms']
      });
      await this.writeOutbox(tx, resolvedTenantId, proof.payment.orderId, domainEvents.orderPaid, {
        orderId: proof.payment.orderId
      });
      await this.writeOutbox(tx, resolvedTenantId, proof.paymentId, domainEvents.paymentSucceeded, {
        paymentId: proof.paymentId,
        proofId: proof.id,
        orderId: proof.payment.orderId,
        provider: 'manual'
      });
      await this.writeOutbox(tx, resolvedTenantId, proof.paymentId, domainEvents.paymentReconciled, {
        paymentId: proof.paymentId,
        proofId: proof.id,
        orderId: proof.payment.orderId,
        source: 'manual-proof'
      });
      const customer = this.readCustomer(proof.payment.order.customer);
      await tx.notification.createMany({
        data: [
          {
            tenantId: resolvedTenantId,
            channel: 'email',
            recipient: customer.email || null,
            subject: 'Payment approved',
            body: `Manual payment for order ${proof.payment.orderId} was approved.`,
            status: customer.email ? 'pending' : 'skipped',
            lastError: customer.email ? null : 'Recipient is missing.',
            metadata: { to: customer.email || null, orderId: proof.payment.orderId }
          },
          {
            tenantId: resolvedTenantId,
            channel: 'sms',
            recipient: customer.phone || null,
            subject: 'Payment approved',
            body: `Manual payment for order ${proof.payment.orderId} was approved.`,
            status: customer.phone ? 'pending' : 'skipped',
            lastError: customer.phone ? null : 'Recipient is missing.',
            metadata: { to: customer.phone || null, orderId: proof.payment.orderId }
          }
        ]
      });
      return tx.manualPaymentProof.findUniqueOrThrow({
        where: { id: reviewed.id },
        include: proofInclude
      });
    });

    return this.toProofSummary(updated);
  }

  async reject(actor: AuthenticatedUser, tenantId: string, proofId: string, reason: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const proof = await this.findProof(resolvedTenantId, proofId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const reviewed = await tx.manualPaymentProof.update({
        where: { id: proof.id },
        data: {
          reviewedAt: new Date(),
          reviewedBy: actor.id,
          rejectionReason: reason.trim()
        },
        include: proofInclude
      });
      await tx.payment.update({
        where: { id: proof.paymentId },
        data: {
          status: PaymentStatus.failed,
          reconciliationStatus: 'failed',
          reconciledAt: new Date(),
          lastProviderEventId: proof.id,
          metadata: this.mergeMetadata(proof.payment.metadata, {
            reconciledFrom: 'manual-proof-rejection',
            manualProofId: proof.id,
            reconciledBy: actor.id,
            reason: reason.trim()
          })
        }
      });
      await tx.order.update({
        where: { id: proof.payment.orderId },
        data: { status: OrderStatus.payment_failed }
      });
      await tx.orderStatusHistory.create({
        data: { orderId: proof.payment.orderId, status: OrderStatus.payment_failed, actorId: actor.id, reason: reason.trim() }
      });
      await this.writeAudit(tx, resolvedTenantId, actor.id, 'payment.manual-proof-rejected', proof.id, {
        proofId: proof.id,
        orderId: proof.payment.orderId,
        reason: reason.trim()
      });
      await this.writeOutbox(tx, resolvedTenantId, proof.id, domainEvents.manualProofRejected, {
        proofId: proof.id,
        orderId: proof.payment.orderId,
        reason: reason.trim(),
        notify: ['customer.email', 'customer.sms']
      });
      await this.writeOutbox(tx, resolvedTenantId, proof.payment.orderId, domainEvents.orderPaymentFailed, {
        orderId: proof.payment.orderId,
        reason: reason.trim()
      });
      await this.releaseReservations(tx, resolvedTenantId, proof.payment.orderId, actor.id, reason.trim());
      await this.writeOutbox(tx, resolvedTenantId, proof.paymentId, domainEvents.paymentFailed, {
        paymentId: proof.paymentId,
        proofId: proof.id,
        orderId: proof.payment.orderId,
        provider: 'manual',
        reason: reason.trim()
      });
      const customer = this.readCustomer(proof.payment.order.customer);
      await tx.notification.createMany({
        data: [
          {
            tenantId: resolvedTenantId,
            channel: 'email',
            recipient: customer.email || null,
            subject: 'Payment rejected',
            body: `Manual payment for order ${proof.payment.orderId} was rejected.`,
            status: customer.email ? 'pending' : 'skipped',
            lastError: customer.email ? null : 'Recipient is missing.',
            metadata: { to: customer.email || null, orderId: proof.payment.orderId }
          },
          {
            tenantId: resolvedTenantId,
            channel: 'sms',
            recipient: customer.phone || null,
            subject: 'Payment rejected',
            body: `Manual payment for order ${proof.payment.orderId} was rejected.`,
            status: customer.phone ? 'pending' : 'skipped',
            lastError: customer.phone ? null : 'Recipient is missing.',
            metadata: { to: customer.phone || null, orderId: proof.payment.orderId }
          }
        ]
      });
      return tx.manualPaymentProof.findUniqueOrThrow({
        where: { id: reviewed.id },
        include: proofInclude
      });
    });

    return this.toProofSummary(updated);
  }

  private async findProof(tenantId: string, proofId: string) {
    const proof = await this.prisma.manualPaymentProof.findFirst({
      where: {
        id: proofId,
        payment: { tenantId }
      },
      include: proofInclude
    });
    if (!proof) {
      throw new NotFoundException('Manual payment proof was not found.');
    }
    if (proof.reviewedAt) {
      throw new BadRequestException('This proof has already been reviewed.');
    }
    return proof;
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

  private toProofSummary(proof: ProofWithDetails) {
    const customer =
      proof.payment.order.customer && typeof proof.payment.order.customer === 'object' && !Array.isArray(proof.payment.order.customer)
        ? (proof.payment.order.customer as Record<string, unknown>)
        : {};

    const customerName = typeof customer.name === 'string' ? customer.name : 'Customer';
    const customerEmail = typeof customer.email === 'string' ? customer.email : '';

    return {
      id: proof.id,
      paymentId: proof.paymentId,
      orderId: proof.payment.orderId,
      methodLabel: proof.manualPaymentMethod.label,
      customerName,
      customerEmail,
      amountCents: proof.payment.amountCents,
      currency: proof.payment.currency,
      paymentStatus: proof.payment.status,
      orderStatus: proof.payment.order.status,
      reconciliationStatus: proof.payment.reconciliationStatus,
      reconciledAt: proof.payment.reconciledAt?.toISOString() ?? null,
      lastProviderEventId: proof.payment.lastProviderEventId,
      receiptUrl: proof.receiptUrl,
      note: proof.note,
      createdAt: proof.createdAt.toISOString()
    };
  }

  private async writeAudit(tx: Prisma.TransactionClient, tenantId: string, actorId: string, action: string, target: string, payload: Record<string, unknown>) {
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

  private async releaseReservations(
    tx: Prisma.TransactionClient,
    tenantId: string,
    orderId: string,
    actorId: string,
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
          actorId,
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
}

type ProofWithDetails = Prisma.ManualPaymentProofGetPayload<{ include: typeof proofInclude }>;
