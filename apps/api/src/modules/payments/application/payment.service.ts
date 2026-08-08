import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CloudinaryStorageService } from '../../../infrastructure/storage/cloudinary.service.js';
import { R2StorageService } from '../../../infrastructure/storage/r2.service.js';
import { PaypalPaymentService } from '../../../infrastructure/payments/paypal/paypal-payment.service.js';
import { StripePaymentService } from '../../../infrastructure/payments/stripe/stripe-payment.service.js';
import { PaymentPolicy } from '../domain/payment-policy.js';
import type { CreateReceiptUploadDto, InitiatePaymentDto, SubmitManualProofDto } from '../presentation/dto/payment.dto.js';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryStorageService,
    private readonly r2: R2StorageService,
    private readonly stripe: StripePaymentService,
    private readonly paypal: PaypalPaymentService,
  ) { }

  async listManualMethods(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const methods = await this.prisma.manualPaymentMethod.findMany({
      where: { tenantId: resolvedTenantId, active: true },
      orderBy: { label: 'asc' }
    });
    return methods.map((method) => ({
      id: method.id,
      key: method.key,
      label: method.label,
      instructions: method.instructions
    }));
  }

  async getGatewayStatus(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const manualCount = await this.prisma.manualPaymentMethod.count({
      where: { tenantId: resolvedTenantId, active: true },
    });

    return {
      stripe: { isAvailable: this.stripe.isConfigured() },
      paypal: { isAvailable: this.paypal.isConfigured() },
      manual: { isAvailable: manualCount > 0 },
    };
  }

  async initiatePayment(tenantId: string, idempotencyKey: string | undefined, dto: InitiatePaymentDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const existing = await this.findIdempotent(resolvedTenantId, idempotencyKey, 'payment-initiate');
    if (existing) {
      return existing;
    }

    const order = await this.findVerifiedOrder(resolvedTenantId, dto.orderId, dto);
    PaymentPolicy.ensurePayable(order);
    const providerResult = await this.createProviderIntent(dto.provider, {
      amountCents: order.totalCents,
      currency: order.currency,
      orderId: order.id
    });

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          tenantId: resolvedTenantId,
          orderId: order.id,
          provider: dto.provider,
          status:
            dto.provider === PaymentProvider.manual
              ? PaymentStatus.manual_proof_required
              : PaymentStatus.requires_action,
          amountCents: order.totalCents,
          currency: order.currency,
          providerRef: this.providerRef(providerResult),
          metadata: providerResult as Prisma.InputJsonValue
        }
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.payment_pending }
      });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.payment_pending, reason: 'Payment initiated.' }
      });
      await this.writeAudit(tx, resolvedTenantId, null, 'payment.initiated', created.id, { orderId: order.id });
      await this.writeOutbox(tx, resolvedTenantId, created.id, domainEvents.paymentInitiated, { paymentId: created.id, orderId: order.id });
      await this.writeOutbox(tx, resolvedTenantId, order.id, domainEvents.orderPaymentPending, { orderId: order.id });
      return created;
    });

    const response = this.toPaymentSummary(payment);
    await this.storeIdempotent(resolvedTenantId, idempotencyKey, 'payment-initiate', response);
    return response;
  }

  async createReceiptUpload(tenantId: string, dto: CreateReceiptUploadDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const order = await this.findVerifiedOrder(resolvedTenantId, dto.orderId, dto);
    PaymentPolicy.ensurePayable(order);
    if (dto.sizeBytes && dto.sizeBytes > 10 * 1024 * 1024) {
      throw new BadRequestException('Receipt upload must be 10 MB or smaller.');
    }

    if (this.cloudinary.isConfigured() && dto.contentType !== 'application/pdf') {
      return this.cloudinary.createSignedReceiptUpload({
        tenantId: resolvedTenantId,
        orderId: order.id,
        contentType: dto.contentType
      });
    }

    const objectKey = this.r2.createSafeReceiptObjectKey({
      tenantId: resolvedTenantId,
      orderId: order.id,
      contentType: dto.contentType
    });
    const uploadUrl = this.r2.isConfigured()
      ? await this.r2.createSignedUploadUrl(objectKey, dto.contentType)
      : `http://localhost/upload-placeholder/${objectKey}`;

    return {
      provider: 'r2' as const,
      uploadUrl,
      fields: {},
      objectKey,
      publicUrl: this.r2.createPublicUrl(objectKey),
      expiresInSeconds: 300
    };
  }

  async submitManualProof(tenantId: string, idempotencyKey: string | undefined, dto: SubmitManualProofDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const existing = await this.findIdempotent(resolvedTenantId, idempotencyKey, 'manual-proof-submit');
    if (existing) {
      return existing;
    }

    const order = await this.findVerifiedOrder(resolvedTenantId, dto.orderId, dto);
    try {
      PaymentPolicy.ensurePayable(order);
    } catch (error) {
      if (order.reservationExpiresAt && order.reservationExpiresAt <= new Date()) {
        await this.expireOrder(resolvedTenantId, order.id);
      }
      throw error;
    }

    const method = await this.prisma.manualPaymentMethod.findFirst({
      where: { id: dto.manualPaymentMethodId, tenantId: resolvedTenantId, active: true }
    });
    if (!method) {
      throw new NotFoundException('Manual payment method was not found.');
    }
    const tenant = await this.prisma.tenant.findUnique({ where: { id: resolvedTenantId } });
    const adminEmail = tenant?.businessEmail ?? null;
    const adminPhone = tenant?.businessPhone ?? null;

    const proof = await this.prisma.$transaction(async (tx) => {
      const payment =
        order.payments.find((item) => item.provider === PaymentProvider.manual && item.status !== PaymentStatus.failed) ??
        (await tx.payment.create({
          data: {
            tenantId: resolvedTenantId,
            orderId: order.id,
            provider: PaymentProvider.manual,
            status: PaymentStatus.manual_proof_required,
            amountCents: order.totalCents,
            currency: order.currency,
            metadata: { createdFrom: 'manual-proof-submit' }
          }
        }));

      const createdProof = await tx.manualPaymentProof.create({
        data: {
          paymentId: payment.id,
          manualPaymentMethodId: method.id,
          receiptUrl: dto.receiptUrl,
          ...(dto.objectKey ? { objectKey: dto.objectKey } : {}),
          ...(dto.storageProvider ? { storageProvider: dto.storageProvider } : {}),
          contentType: dto.contentType,
          ...(dto.note ? { note: dto.note.trim() } : {})
        },
        include: { payment: true, manualPaymentMethod: true }
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.awaiting_admin_approval }
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.awaiting_admin_payment_approval }
      });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.manual_payment_proof_submitted, reason: 'Manual proof submitted.' }
      });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.awaiting_admin_payment_approval, reason: 'Awaiting payment review.' }
      });
      await this.writeAudit(tx, resolvedTenantId, null, 'payment.manual-proof-submitted', createdProof.id, {
        orderId: order.id,
        paymentId: payment.id
      });
      await this.writeOutbox(tx, resolvedTenantId, createdProof.id, domainEvents.manualProofSubmitted, {
        proofId: createdProof.id,
        orderId: order.id,
        notify: ['admin.email', 'admin.sms', 'admin.whatsapp']
      });
      await tx.notification.createMany({
        data: [
          {
            tenantId: resolvedTenantId,
            channel: 'email',
            recipient: adminEmail,
            subject: 'Manual payment proof needs review',
            body: `Order ${order.id} has a new manual payment receipt.`,
            status: adminEmail ? 'pending' : 'skipped',
            lastError: adminEmail ? null : 'Recipient is missing.',
            metadata: { to: adminEmail, orderId: order.id, proofId: createdProof.id }
          },
          {
            tenantId: resolvedTenantId,
            channel: 'sms',
            recipient: adminPhone,
            subject: 'Manual payment proof needs review',
            body: `Order ${order.id} has a new manual payment receipt.`,
            status: adminPhone ? 'pending' : 'skipped',
            lastError: adminPhone ? null : 'Recipient is missing.',
            metadata: { to: adminPhone, orderId: order.id, proofId: createdProof.id }
          },
          {
            tenantId: resolvedTenantId,
            channel: 'whatsapp',
            recipient: adminPhone,
            subject: 'Manual payment proof needs review',
            body: `Order ${order.id} has a new manual payment receipt.`,
            status: adminPhone ? 'pending' : 'skipped',
            lastError: adminPhone ? null : 'Recipient is missing.',
            metadata: { to: adminPhone, orderId: order.id, proofId: createdProof.id }
          }
        ]
      });
      return createdProof;
    });

    const response = {
      id: proof.id,
      paymentId: proof.paymentId,
      orderId: proof.payment.orderId,
      methodLabel: proof.manualPaymentMethod.label,
      status: PaymentStatus.awaiting_admin_approval
    };
    await this.storeIdempotent(resolvedTenantId, idempotencyKey, 'manual-proof-submit', response);
    return response;
  }

  private async findVerifiedOrder(tenantId: string, orderId: string, verification: { email: string; phone: string }) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { payments: true }
    });
    if (!order) {
      throw new NotFoundException('Order was not found.');
    }
    PaymentPolicy.ensureCustomerMatches(order.customer, verification);
    return order;
  }

  private async createProviderIntent(provider: PaymentProvider, input: { amountCents: number; currency: string; orderId: string }) {
    if (provider === PaymentProvider.stripe) {
      return this.stripe.createPaymentIntent(input);
    }
    if (provider === PaymentProvider.paypal) {
      return this.paypal.createOrderIntent(input);
    }
    return { provider: 'manual', status: 'manual_proof_required' };
  }

  private providerRef(providerResult: unknown) {
    if (providerResult && typeof providerResult === 'object' && 'id' in providerResult) {
      return String(providerResult.id);
    }
    return null;
  }

  private toPaymentSummary(payment: {
    id: string;
    orderId: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    amountCents: number;
    currency: string;
    providerRef: string | null;
    metadata?: Prisma.JsonValue;
    reconciliationStatus?: string;
    reconciledAt?: Date | null;
    lastProviderEventId?: string | null;
  }) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      providerRef: payment.providerRef,
      metadata: payment.metadata ?? null,
      reconciliationStatus: payment.reconciliationStatus ?? 'pending',
      reconciledAt: payment.reconciledAt?.toISOString() ?? null,
      lastProviderEventId: payment.lastProviderEventId ?? null
    };
  }

  private async expireOrder(tenantId: string, orderId: string) {
    await this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.expired } });
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId: orderId,
        name: domainEvents.orderPaymentFailed,
        payload: { orderId, reason: 'reservation-expired', sideEffects: ['inventory.release.placeholder'] }
      }
    });
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

  private async findIdempotent(tenantId: string, key: string | undefined, scope: string) {
    if (!key) {
      return null;
    }
    const record = await this.prisma.idempotencyRecord.findUnique({
      where: { tenantId_key_scope: { tenantId, key, scope } }
    });
    return record?.response ?? null;
  }

  private async storeIdempotent(tenantId: string, key: string | undefined, scope: string, response: unknown) {
    if (!key) {
      return;
    }
    await this.prisma.idempotencyRecord.upsert({
      where: { tenantId_key_scope: { tenantId, key, scope } },
      update: { response: response as Prisma.InputJsonValue },
      create: { tenantId, key, scope, response: response as Prisma.InputJsonValue }
    });
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
