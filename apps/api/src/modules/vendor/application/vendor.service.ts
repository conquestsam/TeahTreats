import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { VendorAccessPolicy } from '../domain/vendor-access-policy.js';

const openOrderStatuses: OrderStatus[] = [
  OrderStatus.inventory_reserved,
  OrderStatus.payment_pending,
  OrderStatus.manual_payment_proof_submitted,
  OrderStatus.awaiting_admin_payment_approval,
  OrderStatus.payment_approved,
  OrderStatus.paid,
  OrderStatus.preparing,
  OrderStatus.ready_for_pickup,
  OrderStatus.ready_for_pickup_dispatch
];

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(actor: AuthenticatedUser, tenantId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const [
      tenant,
      productCount,
      activeProductCount,
      draftProductCount,
      archivedProductCount,
      inventoryBatches,
      openOrderCount,
      pendingManualPaymentCount
    ] = await Promise.all([
      this.findTenantOrThrow(resolvedTenantId),
      this.prisma.product.count({ where: { tenantId: resolvedTenantId } }),
      this.prisma.product.count({
        where: { tenantId: resolvedTenantId, status: ProductStatus.active }
      }),
      this.prisma.product.count({
        where: { tenantId: resolvedTenantId, status: ProductStatus.draft }
      }),
      this.prisma.product.count({
        where: { tenantId: resolvedTenantId, status: ProductStatus.archived }
      }),
      this.prisma.inventoryBatch.findMany({
        where: { tenantId: resolvedTenantId },
        select: {
          skuId: true,
          quantity: true,
          reserved: true,
          expiresAt: true,
          expiredAt: true
        }
      }),
      this.prisma.order.count({
        where: {
          tenantId: resolvedTenantId,
          status: { in: openOrderStatuses }
        }
      }),
      this.prisma.manualPaymentProof.count({
        where: {
          reviewedAt: null,
          payment: {
            tenantId: resolvedTenantId
          }
        }
      })
    ]);

    const now = new Date();
    const availableBySku = new Map<string, number>();
    let expiredBatchCount = 0;
    for (const batch of inventoryBatches) {
      if (batch.expiredAt || (batch.expiresAt && batch.expiresAt <= now)) {
        expiredBatchCount += 1;
        continue;
      }
      availableBySku.set(
        batch.skuId,
        (availableBySku.get(batch.skuId) ?? 0) + Math.max(batch.quantity - batch.reserved, 0),
      );
    }

    return {
      tenant: this.toTenantSummary(tenant),
      metrics: {
        productCount,
        activeProductCount,
        draftProductCount,
        archivedProductCount,
        inventoryAvailableCount: [...availableBySku.values()].reduce((sum, value) => sum + value, 0),
        lowStockCount: [...availableBySku.values()].filter((value) => value > 0 && value <= 5).length,
        expiredBatchCount,
        openOrderCount,
        pendingManualPaymentCount
      }
    };
  }

  async listProducts(actor: AuthenticatedUser, tenantId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const products = await this.prisma.product.findMany({
      where: { tenantId: resolvedTenantId },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        skus: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      status: product.status,
      brand: product.brand,
      category: product.category,
      imageUrl: product.images[0]?.url ?? null,
      skuCount: product.skus.length,
      activeSkuCount: product.skus.filter((sku) => sku.active).length,
      updatedAt: product.updatedAt.toISOString()
    }));
  }

  async getProduct(actor: AuthenticatedUser, tenantId: string, productId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId: resolvedTenantId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        skus: { orderBy: { name: 'asc' } }
      }
    });
    if (!product) {
      throw new NotFoundException('Product was not found.');
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      category: product.category,
      status: product.status,
      metadata: product.metadata,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder
      })),
      skus: product.skus.map((sku) => ({
        id: sku.id,
        name: sku.name,
        priceCents: sku.priceCents,
        currency: sku.currency,
        active: sku.active,
        metadata: sku.metadata
      }))
    };
  }

  async listInventory(actor: AuthenticatedUser, tenantId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const batches = await this.prisma.inventoryBatch.findMany({
      where: { tenantId: resolvedTenantId },
      include: {
        sku: {
          include: {
            product: true
          }
        }
      },
      orderBy: [{ expiredAt: 'asc' }, { expiresAt: 'asc' }, { updatedAt: 'desc' }],
      take: 50
    });

    return batches.map((batch) => ({
      id: batch.id,
      productName: batch.sku.product.name,
      skuName: batch.sku.name,
      quantity: batch.quantity,
      reserved: batch.reserved,
      available: Math.max(batch.quantity - batch.reserved, 0),
      status: this.inventoryStatus(batch),
      expiresAt: batch.expiresAt?.toISOString() ?? null,
      expiredAt: batch.expiredAt?.toISOString() ?? null,
      updatedAt: batch.updatedAt.toISOString()
    }));
  }

  async getInventoryBatch(actor: AuthenticatedUser, tenantId: string, batchId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const batch = await this.prisma.inventoryBatch.findFirst({
      where: { id: batchId, tenantId: resolvedTenantId },
      include: {
        sku: {
          include: {
            product: true
          }
        },
        adjustments: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    if (!batch) {
      throw new NotFoundException('Inventory batch was not found.');
    }

    return {
      id: batch.id,
      productId: batch.sku.productId,
      productName: batch.sku.product.name,
      skuId: batch.skuId,
      skuName: batch.sku.name,
      quantity: batch.quantity,
      reserved: batch.reserved,
      available: Math.max(batch.quantity - batch.reserved, 0),
      status: this.inventoryStatus(batch),
      expiresAt: batch.expiresAt?.toISOString() ?? null,
      expiredAt: batch.expiredAt?.toISOString() ?? null,
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
      adjustments: batch.adjustments.map((adjustment) => ({
        id: adjustment.id,
        type: adjustment.type,
        quantityDelta: adjustment.quantityDelta,
        reason: adjustment.reason,
        createdAt: adjustment.createdAt.toISOString()
      }))
    };
  }

  async listOrders(actor: AuthenticatedUser, tenantId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const orders = await this.prisma.order.findMany({
      where: { tenantId: resolvedTenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      customer: this.toCustomerSummary(order.customer),
      reservationExpiresAt: order.reservationExpiresAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));
  }

  async getOrder(actor: AuthenticatedUser, tenantId: string, orderId: string) {
    const resolvedTenantId = await this.resolveAndEnsureAccess(actor, tenantId);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: resolvedTenantId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        },
        reservations: {
          orderBy: { createdAt: 'asc' },
          include: {
            batch: {
              include: {
                sku: true
              }
            }
          }
        }
      }
    });
    if (!order) {
      throw new NotFoundException('Order was not found.');
    }

    return {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      customer: this.toCustomerSummary(order.customer),
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

  private async resolveAndEnsureAccess(actor: AuthenticatedUser, tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { slug: tenantId }]
      },
      select: { id: true, active: true }
    });
    return VendorAccessPolicy.ensureAssignedActiveTenant({ actor, tenant });
  }

  private async findTenantOrThrow(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant;
  }

  private toTenantSummary(tenant: {
    id: string;
    name: string;
    slug: string;
    businessEmail: string | null;
    businessPhone: string | null;
    active: boolean;
    delegatedRoleApprovalRequired: boolean;
    manualPaymentEnabled: boolean;
    defaultCurrency: string;
    timezone: string;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    deactivatedAt: Date | null;
  }) {
    const metadata =
      tenant.metadata && typeof tenant.metadata === 'object' && !Array.isArray(tenant.metadata)
        ? (tenant.metadata as Record<string, unknown>)
        : {};

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      businessEmail: tenant.businessEmail,
      businessPhone: tenant.businessPhone,
      active: tenant.active,
      delegatedRoleApprovalRequired: tenant.delegatedRoleApprovalRequired,
      manualPaymentEnabled: tenant.manualPaymentEnabled,
      defaultCurrency: tenant.defaultCurrency,
      timezone: tenant.timezone,
      settings: {
        businessAddress:
          metadata.businessAddress && typeof metadata.businessAddress === 'object'
            ? metadata.businessAddress
            : undefined,
        orderReadinessNotificationChannels: Array.isArray(metadata.orderReadinessNotificationChannels)
          ? metadata.orderReadinessNotificationChannels
          : ['email']
      },
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
      deactivatedAt: tenant.deactivatedAt?.toISOString() ?? null
    };
  }

  private toCustomerSummary(customer: Prisma.JsonValue) {
    if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
      return { name: 'Customer', email: null };
    }
    const record = customer as Record<string, unknown>;
    return {
      name: typeof record.name === 'string' ? record.name : 'Customer',
      email: typeof record.email === 'string' ? record.email : null,
      phone: typeof record.phone === 'string' ? record.phone : null,
      address: typeof record.address === 'string' ? record.address : null
    };
  }

  private inventoryStatus(input: {
    quantity: number;
    reserved: number;
    expiresAt: Date | null;
    expiredAt: Date | null;
  }) {
    if (input.expiredAt || (input.expiresAt && input.expiresAt <= new Date())) {
      return 'expired';
    }
    const available = Math.max(input.quantity - input.reserved, 0);
    if (available <= 0) {
      return 'out_of_stock';
    }
    if (available <= 5) {
      return 'low_stock';
    }
    return 'in_stock';
  }
}
