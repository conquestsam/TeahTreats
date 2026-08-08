import { BadRequestException, Injectable } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import {
  InventoryAdjustmentType,
  OrderStatus,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { PromotionsService } from '../../promotions/application/promotions.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { CheckoutPolicy } from '../domain/checkout-policy.js';
import type { StartCheckoutDto } from '../presentation/dto/checkout.dto.js';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promotions: PromotionsService,
  ) {}

  async startCheckout(
    tenantId: string,
    sessionId: string,
    idempotencyKey: string | undefined,
    dto: StartCheckoutDto,
    user?: AuthenticatedUser,
  ) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const existing = idempotencyKey
      ? await this.prisma.idempotencyRecord.findUnique({
          where: {
            tenantId_key_scope: {
              tenantId: resolvedTenantId,
              key: idempotencyKey,
              scope: 'checkout-start'
            }
          }
        })
      : null;

    if (existing?.response) {
      return existing.response;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (idempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            tenantId: resolvedTenantId,
            key: idempotencyKey,
            scope: 'checkout-start'
          }
        }).catch(() => null);
      }

      const cart = await tx.cart.findFirst({
        where: {
          tenantId: resolvedTenantId,
          OR: [
            ...(user?.userType === 'customer' ? [{ userId: user.id }] : []),
            { sessionId }
          ]
        },
        include: {
          items: {
            include: {
              sku: {
                include: { product: true }
              }
            }
          }
        }
      });

      if (!cart) {
        throw new BadRequestException('Cart is empty.');
      }
      CheckoutPolicy.ensureCartReady(cart);

      const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const totalCents = cart.items.reduce(
        (total, item) => total + item.quantity * item.sku.priceCents,
        0,
      );
      const currency = cart.items[0]?.sku.currency ?? 'USD';
      const pricingItems = cart.items.map((item) => ({
        skuId: item.skuId,
        productId: item.sku.productId,
        productName: item.sku.product.name,
        skuName: item.sku.name,
        unitPriceCents: item.sku.priceCents,
        currency: item.sku.currency,
        quantity: item.quantity,
        lineTotalCents: item.quantity * item.sku.priceCents,
        product: {
          id: item.sku.productId,
          brand: item.sku.product.brand,
          category: item.sku.product.category
        }
      }));
      const customerEmail = user?.userType === 'customer' ? user.email : dto.email.toLowerCase();
      const discount = await this.promotions.calculateCouponDiscount({
        tenantId: resolvedTenantId,
        items: pricingItems,
        customerEmail,
        ...(dto.couponCode ? { code: dto.couponCode } : {}),
        ...(user?.userType === 'customer' ? { userId: user.id } : {}),
        tx
      });
      const discountCents = discount.valid ? discount.discountCents : 0;
      const finalTotalCents = Math.max(0, totalCents - discountCents);
      const order = await tx.order.create({
        data: {
          tenantId: resolvedTenantId,
          ...(user?.userType === 'customer' ? { userId: user.id } : {}),
          status: OrderStatus.inventory_reserved,
          subtotalCents: totalCents,
          discountCents,
          totalCents: finalTotalCents,
          currency,
          reservationExpiresAt,
          promotionSnapshot: {
            couponCode: discount.summary.code || null,
            valid: discount.valid,
            discountLines: discount.summary.discountLines
          },
          customer: {
            name: user?.userType === 'customer' ? user.name : dto.name.trim(),
            email: customerEmail,
            phone: dto.phone.trim(),
            address: dto.address.trim()
          },
          items: {
            create: cart.items.map((item) => ({
              skuId: item.skuId,
              productName: item.sku.product.name,
              skuName: item.sku.name,
              unitPriceCents: item.sku.priceCents,
              quantity: item.quantity,
              lineTotalCents: item.quantity * item.sku.priceCents,
              snapshot: {
                productId: item.sku.productId,
                skuId: item.skuId,
                currency: item.sku.currency,
                priceCents: item.sku.priceCents
              }
            }))
          },
          history: {
            create: [{ status: OrderStatus.checkout_started }, { status: OrderStatus.inventory_reserved }]
          }
        }
      });

      for (const item of cart.items) {
        await this.reserveItem(tx, {
          tenantId: resolvedTenantId,
          skuId: item.skuId,
          productId: item.sku.productId,
          orderId: order.id,
          quantity: item.quantity,
          reservationExpiresAt
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (discount.valid && discount.promotionId) {
        await this.promotions.recordRedemption({
          tx,
          tenantId: resolvedTenantId,
          promotionId: discount.promotionId,
          couponCodeId: discount.couponCodeId,
          orderId: order.id,
          customerEmail,
          ...(user?.userType === 'customer' ? { userId: user.id } : {}),
          discountCents,
          snapshot: {
            couponCode: discount.summary.code,
            discountLines: discount.summary.discountLines
          }
        });
      }
      await this.writeOutbox(tx, resolvedTenantId, order.id, domainEvents.checkoutStarted, { orderId: order.id });
      await this.writeOutbox(tx, resolvedTenantId, order.id, domainEvents.orderCreated, { orderId: order.id });
      await this.writeOutbox(tx, resolvedTenantId, order.id, domainEvents.cartUpdated, {
        cartId: cart.id,
        reason: 'checkout-started',
        sideEffects: ['cart.cache.invalidate', 'sse.checkout.started']
      });

      await tx.notification.createMany({
        data: [
          {
            tenantId: resolvedTenantId,
            channel: 'email',
            recipient: customerEmail,
            subject: 'Order Created & Inventory Reserved',
            body: `Your order #${order.id.slice(0, 8)} has been created. Total: ${(order.totalCents / 100).toFixed(2)} ${order.currency}.`,
            status: customerEmail ? 'pending' : 'skipped',
            lastError: customerEmail ? null : 'Recipient is missing.',
            metadata: { to: customerEmail, orderId: order.id, totalCents: order.totalCents }
          },
          {
            tenantId: resolvedTenantId,
            channel: 'sms',
            recipient: dto.phone.trim(),
            subject: 'Order Created',
            body: `Order #${order.id.slice(0, 8)} created. Complete payment before reservation expires.`,
            status: dto.phone.trim() ? 'pending' : 'skipped',
            lastError: dto.phone.trim() ? null : 'Recipient is missing.',
            metadata: { to: dto.phone.trim(), orderId: order.id }
          }
        ]
      });

      const response = {
        orderId: order.id,
        status: order.status,
        subtotalCents: totalCents,
        discountCents,
        totalCents: order.totalCents,
        currency: order.currency,
        discountLines: discount.valid ? discount.summary.discountLines : [],
        reservationExpiresAt: reservationExpiresAt.toISOString()
      };

      if (idempotencyKey) {
        await tx.idempotencyRecord.update({
          where: {
            tenantId_key_scope: {
              tenantId: resolvedTenantId,
              key: idempotencyKey,
              scope: 'checkout-start'
            }
          },
          data: { response }
        });
      }

      return response;
    });

    return result;
  }

  private async reserveItem(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      skuId: string;
      productId: string;
      orderId: string;
      quantity: number;
      reservationExpiresAt: Date;
    },
  ) {
    let remaining = input.quantity;
    const batches = await tx.inventoryBatch.findMany({
      where: {
        tenantId: input.tenantId,
        skuId: input.skuId,
        expiredAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }]
    });

    for (const batch of batches) {
      if (remaining <= 0) {
        break;
      }

      const available = batch.quantity - batch.reserved;
      const reserveQuantity = Math.min(available, remaining);
      if (reserveQuantity <= 0) {
        continue;
      }

      const updated = await tx.inventoryBatch.updateMany({
        where: {
          id: batch.id,
          quantity: { gte: batch.reserved + reserveQuantity }
        },
        data: {
          reserved: { increment: reserveQuantity }
        }
      });
      if (updated.count === 0) {
        continue;
      }

      const reservation = await tx.inventoryReservation.create({
        data: {
          tenantId: input.tenantId,
          batchId: batch.id,
          orderId: input.orderId,
          quantity: reserveQuantity,
          expiresAt: input.reservationExpiresAt
        }
      });
      await tx.inventoryAdjustment.create({
        data: {
          tenantId: input.tenantId,
          batchId: batch.id,
          skuId: input.skuId,
          type: InventoryAdjustmentType.reservation,
          quantityDelta: 0,
          reason: `Checkout reservation ${reservation.id}`
        }
      });
      await this.writeOutbox(tx, input.tenantId, reservation.id, domainEvents.inventoryReserved, {
        reservationId: reservation.id,
        batchId: batch.id,
        orderId: input.orderId,
        skuId: input.skuId,
        quantity: reserveQuantity
      });
      await this.writeOutbox(tx, input.tenantId, input.productId, domainEvents.productChanged, {
        productId: input.productId,
        skuId: input.skuId,
        sideEffects: ['cache.invalidate', 'search.sync']
      });

      remaining -= reserveQuantity;
    }

    if (remaining > 0) {
      throw new BadRequestException('Not enough stock is available.');
    }
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

  private async writeOutbox(
    tx: Prisma.TransactionClient,
    tenantId: string,
    aggregateId: string,
    name: (typeof domainEvents)[keyof typeof domainEvents],
    payload: Record<string, unknown>,
  ) {
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
