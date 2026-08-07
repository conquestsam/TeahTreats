import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CartPolicy } from '../domain/cart-policy.js';
import type { AddCartItemDto, UpdateCartItemDto } from '../presentation/dto/cart.dto.js';

const cartInclude = {
  items: {
    include: {
      sku: {
        include: {
          product: true
        }
      }
    },
    orderBy: { id: 'asc' as const }
  }
} as const;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(tenantId: string, sessionId: string) {
    CartPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const cart =
      (await this.prisma.cart.findFirst({
        where: { tenantId: resolvedTenantId, sessionId },
        include: cartInclude
      })) ??
      (await this.prisma.cart.create({
        data: { tenantId: resolvedTenantId, sessionId },
        include: cartInclude
      }));

    return this.toCartSummary(cart);
  }

  async mergeGuestCartIntoCustomer(tenantId: string, sessionId: string | undefined, userId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const guestCart = sessionId
      ? await this.prisma.cart.findFirst({
          where: { tenantId: resolvedTenantId, sessionId },
          include: { items: true }
        })
      : null;
    let customerCart = await this.prisma.cart.findFirst({
      where: { tenantId: resolvedTenantId, userId },
      include: cartInclude
    });

    if (!guestCart && customerCart) {
      return this.toCartSummary(customerCart);
    }

    const mergedCart = await this.prisma.$transaction(async (tx) => {
      if (!customerCart) {
        customerCart = await tx.cart.create({
          data: {
            tenantId: resolvedTenantId,
            userId,
            ...(sessionId ? { sessionId } : {})
          },
          include: cartInclude
        });
      } else if (sessionId && customerCart.sessionId !== sessionId) {
        customerCart = await tx.cart.update({
          where: { id: customerCart.id },
          data: { sessionId },
          include: cartInclude
        });
      }

      if (guestCart && guestCart.id !== customerCart.id) {
        for (const item of guestCart.items) {
          await tx.cartItem.upsert({
            where: {
              cartId_skuId: {
                cartId: customerCart.id,
                skuId: item.skuId
              }
            },
            update: { quantity: { increment: item.quantity } },
            create: {
              cartId: customerCart.id,
              skuId: item.skuId,
              quantity: item.quantity
            }
          });
        }
        await tx.cart.delete({ where: { id: guestCart.id } });
      }

      await this.writeCartUpdated(tx, resolvedTenantId, customerCart.id, 'guest-cart-migrated');
      return tx.cart.findUniqueOrThrow({ where: { id: customerCart.id }, include: cartInclude });
    });

    return this.toCartSummary(mergedCart);
  }

  async addItem(tenantId: string, sessionId: string, dto: AddCartItemDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const sku = await this.findSellableSku(resolvedTenantId, dto.skuId, dto.quantity);
    let cart = await this.prisma.cart.findFirst({
      where: { tenantId: resolvedTenantId, sessionId }
    });
    cart ??= await this.prisma.cart.create({
      data: { tenantId: resolvedTenantId, sessionId }
    });

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.upsert({
        where: {
          cartId_skuId: {
            cartId: cart.id,
            skuId: sku.id
          }
        },
        update: {
          quantity: { increment: dto.quantity }
        },
        create: {
          cartId: cart.id,
          skuId: sku.id,
          quantity: dto.quantity
        }
      });
      await this.writeCartUpdated(tx, resolvedTenantId, cart.id, 'item-added');

      return tx.cart.findUniqueOrThrow({ where: { id: cart.id }, include: cartInclude });
    });

    return this.toCartSummary(updatedCart);
  }

  async updateItem(tenantId: string, sessionId: string, itemId: string, dto: UpdateCartItemDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const cart = await this.findCartOrThrow(resolvedTenantId, sessionId);
    await this.prisma.cartItem.updateMany({
      where: { id: itemId, cartId: cart.id },
      data: { quantity: dto.quantity }
    });
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId: resolvedTenantId,
        aggregateId: cart.id,
        name: domainEvents.cartUpdated,
        payload: { cartId: cart.id, reason: 'item-updated' }
      }
    });

    return this.getOrCreateCart(resolvedTenantId, sessionId);
  }

  async removeItem(tenantId: string, sessionId: string, itemId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const cart = await this.findCartOrThrow(resolvedTenantId, sessionId);
    await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
      await this.writeCartUpdated(tx, resolvedTenantId, cart.id, 'item-removed');
    });

    return this.getOrCreateCart(resolvedTenantId, sessionId);
  }

  async clearCart(tenantId: string, sessionId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const cart = await this.findCartOrThrow(resolvedTenantId, sessionId);
    await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.writeCartUpdated(tx, resolvedTenantId, cart.id, 'cart-cleared');
    });

    return this.getOrCreateCart(resolvedTenantId, sessionId);
  }

  async findCartForCheckout(tenantId: string, sessionId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    return CartPolicy.ensureFound(
      await this.prisma.cart.findFirst({
        where: { tenantId: resolvedTenantId, sessionId },
        include: cartInclude
      }),
      'Cart is empty.',
    );
  }

  toCartSummary(cart: CartWithItems) {
    const items = cart.items.map((item) => ({
      id: item.id,
      skuId: item.skuId,
      productId: item.sku.productId,
      productName: item.sku.product.name,
      skuName: item.sku.name,
      unitPriceCents: item.sku.priceCents,
      currency: item.sku.currency,
      quantity: item.quantity,
      lineTotalCents: item.quantity * item.sku.priceCents
    }));
    const totalCents = items.reduce((total, item) => total + item.lineTotalCents, 0);

    return {
      id: cart.id,
      tenantId: cart.tenantId,
      items,
      subtotalCents: totalCents,
      discountCents: 0,
      totalCents,
      currency: items[0]?.currency ?? 'USD',
      discountLines: [],
      updatedAt: cart.updatedAt.toISOString()
    };
  }

  private async findCartOrThrow(tenantId: string, sessionId: string) {
    return CartPolicy.ensureFound(
      await this.prisma.cart.findFirst({ where: { tenantId, sessionId } }),
      'Cart was not found.',
    );
  }

  private async findSellableSku(tenantId: string, skuId: string, requestedQuantity: number) {
    const sku = CartPolicy.ensureFound(
      await this.prisma.sku.findFirst({
        where: { id: skuId, tenantId },
        include: { product: true }
      }),
      'SKU was not found.',
    );
    CartPolicy.ensureSkuSellable({ active: sku.active, productStatus: sku.product.status });
    const now = new Date();
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId,
        skuId,
        expiredAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      },
      select: {
        quantity: true,
        reserved: true
      }
    });
    const availableQuantity = batches.reduce((total, batch) => {
      return total + Math.max(0, batch.quantity - batch.reserved);
    }, 0);
    if (availableQuantity < requestedQuantity) {
      throw new BadRequestException('This snack is not available right now.');
    }
    return sku;
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant.id;
  }

  private async writeCartUpdated(
    tx: Prisma.TransactionClient,
    tenantId: string,
    cartId: string,
    reason: string,
  ) {
    await tx.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId: cartId,
        name: domainEvents.cartUpdated,
        payload: { cartId, reason, sideEffects: ['cart.cache.invalidate', 'sse.cart.updated'] }
      }
    });
  }
}

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
