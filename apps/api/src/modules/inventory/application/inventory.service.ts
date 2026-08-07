import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import {
  InventoryAdjustmentType,
  Prisma,
  ProductStatus
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { InventoryPolicy } from '../domain/inventory-policy.js';
import type {
  AdjustInventoryBatchDto,
  CreateInventoryBatchDto,
  ReserveInventoryDto
} from '../presentation/dto/inventory.dto.js';

const batchInclude = {
  sku: {
    include: {
      product: true
    }
  },
  adjustments: {
    orderBy: { createdAt: 'desc' as const },
    take: 20
  }
} as const;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listBatches(tenantId: string) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const batches = await this.prisma.inventoryBatch.findMany({
      where: { tenantId: resolvedTenantId },
      include: batchInclude,
      orderBy: [{ expiredAt: 'asc' }, { expiresAt: 'asc' }, { updatedAt: 'desc' }]
    });

    return batches.map((batch) => this.toBatchSummary(batch));
  }

  async listSkuOptions(tenantId: string) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const skus = await this.prisma.sku.findMany({
      where: {
        tenantId: resolvedTenantId,
        product: {
          status: { not: ProductStatus.archived }
        }
      },
      include: { product: true },
      orderBy: [{ product: { name: 'asc' } }, { name: 'asc' }]
    });

    return skus.map((sku) => ({
      id: sku.id,
      name: sku.name,
      productId: sku.productId,
      productName: sku.product.name,
      productStatus: sku.product.status,
      active: sku.active,
      isPerishable: this.isPerishable(sku.metadata, sku.product.metadata)
    }));
  }

  async getBatch(tenantId: string, batchId: string) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const batch = InventoryPolicy.ensureFound(
      await this.prisma.inventoryBatch.findFirst({
        where: { id: batchId, tenantId: resolvedTenantId },
        include: batchInclude
      }),
    );

    return this.toBatchSummary(batch);
  }

  async createBatch(actor: AuthenticatedUser, tenantId: string, dto: CreateInventoryBatchDto) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const sku = await this.findSkuOrThrow(resolvedTenantId, dto.skuId);
    const isPerishable = this.isPerishable(sku.metadata, sku.product.metadata);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    InventoryPolicy.ensureSkuCanReceiveStock({
      active: sku.active,
      productStatus: sku.product.status
    });
    InventoryPolicy.ensureExpiry({
      isPerishable,
      ...(expiresAt ? { expiresAt } : {})
    });

    const batch = await this.prisma.$transaction(async (tx) => {
      const created = await tx.inventoryBatch.create({
        data: {
          tenantId: resolvedTenantId,
          skuId: sku.id,
          quantity: dto.quantity,
          reserved: 0,
          ...(expiresAt ? { expiresAt } : {}),
          adjustments: {
            create: {
              tenantId: resolvedTenantId,
              skuId: sku.id,
              actorId: actor.id,
              type: InventoryAdjustmentType.initial,
              quantityDelta: dto.quantity,
              reason: dto.reason.trim()
            }
          }
        },
        include: batchInclude
      });

      await this.writeAudit(tx, {
        tenantId: resolvedTenantId,
        actorId: actor.id,
        action: 'inventory.batch-created',
        target: created.id,
        payload: { batchId: created.id, skuId: sku.id, quantity: dto.quantity }
      });
      await this.writeOutbox(tx, {
        tenantId: resolvedTenantId,
        aggregateId: created.id,
        name: domainEvents.inventoryBatchCreated,
        payload: { batchId: created.id, skuId: sku.id, quantity: dto.quantity }
      });
      await this.writeInventoryChangedOutbox(tx, resolvedTenantId, sku.productId, sku.id);

      return created;
    });

    return this.toBatchSummary(batch);
  }

  async adjustBatch(
    actor: AuthenticatedUser,
    tenantId: string,
    batchId: string,
    dto: AdjustInventoryBatchDto,
  ) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const batch = InventoryPolicy.ensureFound(
      await this.prisma.inventoryBatch.findFirst({
        where: { id: batchId, tenantId: resolvedTenantId },
        include: batchInclude
      }),
    );
    InventoryPolicy.ensureAdjustmentIsAllowed({
      delta: dto.quantityDelta,
      quantity: batch.quantity,
      reserved: batch.reserved,
      expiredAt: batch.expiredAt,
      expiresAt: batch.expiresAt
    });

    const type =
      dto.quantityDelta > 0 ? InventoryAdjustmentType.increase : InventoryAdjustmentType.decrease;

    const updated = await this.prisma.$transaction(async (tx) => {
      const nextBatch = await tx.inventoryBatch.update({
        where: { id: batch.id },
        data: { quantity: batch.quantity + dto.quantityDelta },
        include: batchInclude
      });

      await tx.inventoryAdjustment.create({
        data: {
          batchId: batch.id,
          tenantId: resolvedTenantId,
          skuId: batch.skuId,
          actorId: actor.id,
          type,
          quantityDelta: dto.quantityDelta,
          reason: dto.reason.trim()
        }
      });
      await this.writeAudit(tx, {
        tenantId: resolvedTenantId,
        actorId: actor.id,
        action: 'inventory.quantity-adjusted',
        target: batch.id,
        payload: { batchId: batch.id, quantityDelta: dto.quantityDelta }
      });
      await this.writeOutbox(tx, {
        tenantId: resolvedTenantId,
        aggregateId: batch.id,
        name: domainEvents.inventoryQuantityAdjusted,
        payload: { batchId: batch.id, skuId: batch.skuId, quantityDelta: dto.quantityDelta }
      });
      await this.writeInventoryChangedOutbox(tx, resolvedTenantId, batch.sku.productId, batch.skuId);

      return nextBatch;
    });

    return this.toBatchSummary(updated);
  }

  async expireBatch(actor: AuthenticatedUser, tenantId: string, batchId: string) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const batch = InventoryPolicy.ensureFound(
      await this.prisma.inventoryBatch.findFirst({
        where: { id: batchId, tenantId: resolvedTenantId },
        include: batchInclude
      }),
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const nextBatch = await tx.inventoryBatch.update({
        where: { id: batch.id },
        data: { expiredAt: new Date() },
        include: batchInclude
      });

      await tx.inventoryAdjustment.create({
        data: {
          batchId: batch.id,
          tenantId: resolvedTenantId,
          skuId: batch.skuId,
          actorId: actor.id,
          type: InventoryAdjustmentType.expire,
          quantityDelta: 0,
          reason: 'Batch manually marked expired.'
        }
      });
      await this.writeAudit(tx, {
        tenantId: resolvedTenantId,
        actorId: actor.id,
        action: 'inventory.batch-expired',
        target: batch.id,
        payload: { batchId: batch.id, skuId: batch.skuId }
      });
      await this.writeOutbox(tx, {
        tenantId: resolvedTenantId,
        aggregateId: batch.id,
        name: domainEvents.inventoryBatchExpired,
        payload: { batchId: batch.id, skuId: batch.skuId }
      });
      await this.writeInventoryChangedOutbox(tx, resolvedTenantId, batch.sku.productId, batch.skuId);

      return nextBatch;
    });

    return this.toBatchSummary(updated);
  }

  async reserveStock(actor: AuthenticatedUser, tenantId: string, dto: ReserveInventoryDto) {
    InventoryPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.findSkuOrThrow(resolvedTenantId, dto.skuId);
    const batch = await this.prisma.inventoryBatch.findFirst({
      where: {
        tenantId: resolvedTenantId,
        skuId: dto.skuId,
        expiredAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      include: batchInclude,
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }]
    });

    if (!batch || batch.quantity - batch.reserved < dto.quantity) {
      throw new BadRequestException('Not enough sellable stock is available.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const nextBatch = await tx.inventoryBatch.update({
        where: { id: batch.id },
        data: { reserved: batch.reserved + dto.quantity },
        include: batchInclude
      });
      const reservation = await tx.inventoryReservation.create({
        data: {
          tenantId: resolvedTenantId,
          batchId: batch.id,
          quantity: dto.quantity,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          ...(dto.orderId ? { orderId: dto.orderId } : {})
        }
      });
      await tx.inventoryAdjustment.create({
        data: {
          batchId: batch.id,
          tenantId: resolvedTenantId,
          skuId: dto.skuId,
          actorId: actor.id,
          type: InventoryAdjustmentType.reservation,
          quantityDelta: 0,
          reason: `Reserved ${dto.quantity} unit(s).`
        }
      });
      await this.writeOutbox(tx, {
        tenantId: resolvedTenantId,
        aggregateId: reservation.id,
        name: domainEvents.inventoryReservationCreated,
        payload: { reservationId: reservation.id, batchId: batch.id, skuId: dto.skuId, quantity: dto.quantity }
      });

      return nextBatch;
    });

    return this.toBatchSummary(updated);
  }

  private async findSkuOrThrow(tenantId: string, skuId: string) {
    return InventoryPolicy.ensureFound(
      await this.prisma.sku.findFirst({
        where: { id: skuId, tenantId },
        include: { product: true }
      }),
      'SKU was not found for this tenant.',
    );
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }]
      }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant.id;
  }

  private isPerishable(skuMetadata: Prisma.JsonValue, productMetadata: Prisma.JsonValue) {
    return this.metadataFlag(skuMetadata, 'isPerishable') || this.metadataFlag(productMetadata, 'isPerishable');
  }

  private metadataFlag(metadata: Prisma.JsonValue, key: string) {
    return Boolean(
      metadata &&
        typeof metadata === 'object' &&
        !Array.isArray(metadata) &&
        key in metadata &&
        (metadata as Record<string, unknown>)[key] === true,
    );
  }

  private toBatchSummary(batch: InventoryBatchWithDetails) {
    const available = Math.max(batch.quantity - batch.reserved, 0);
    const expired = Boolean(batch.expiredAt) || Boolean(batch.expiresAt && batch.expiresAt <= new Date());

    return {
      id: batch.id,
      tenantId: batch.tenantId,
      skuId: batch.skuId,
      skuName: batch.sku.name,
      productId: batch.sku.productId,
      productName: batch.sku.product.name,
      productStatus: batch.sku.product.status,
      quantity: batch.quantity,
      reserved: batch.reserved,
      available,
      expiresAt: batch.expiresAt?.toISOString() ?? null,
      expiredAt: batch.expiredAt?.toISOString() ?? null,
      sellable: !expired && batch.sku.active && batch.sku.product.status === ProductStatus.active && available > 0,
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
      adjustments: batch.adjustments.map((adjustment) => ({
        id: adjustment.id,
        batchId: adjustment.batchId,
        type: adjustment.type,
        quantityDelta: adjustment.quantityDelta,
        reason: adjustment.reason,
        createdAt: adjustment.createdAt.toISOString()
      }))
    };
  }

  private async writeAudit(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      actorId: string;
      action: string;
      target: string;
      payload: Record<string, unknown>;
    },
  ) {
    await tx.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId,
        action: input.action,
        target: input.target,
        metadata: input.payload as Prisma.InputJsonValue
      }
    });
  }

  private async writeOutbox(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      aggregateId: string;
      name: (typeof domainEvents)[keyof typeof domainEvents];
      payload: Record<string, unknown>;
    },
  ) {
    await tx.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        aggregateId: input.aggregateId,
        name: input.name,
        payload: input.payload as Prisma.InputJsonValue
      }
    });
  }

  private writeInventoryChangedOutbox(
    tx: Prisma.TransactionClient,
    tenantId: string,
    productId: string,
    skuId: string,
  ) {
    return this.writeOutbox(tx, {
      tenantId,
      aggregateId: productId,
      name: domainEvents.productChanged,
      payload: {
        productId,
        skuId,
        sideEffects: ['cache.invalidate', 'search.sync']
      }
    });
  }
}

type InventoryBatchWithDetails = Prisma.InventoryBatchGetPayload<{
  include: typeof batchInclude;
}>;
