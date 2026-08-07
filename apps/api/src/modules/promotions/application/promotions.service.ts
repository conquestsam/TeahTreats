import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { domainEvents, type CouponValidationSummary } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import {
  Prisma,
  PromotionDiscountType,
  PromotionStatus,
  PromotionTargetType
} from '@prisma/client';
import type { Promotion } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { OutboxService } from '../../outbox/application/outbox.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import type {
  CreatePromotionDto,
  UpdatePromotionDto,
  ValidateCouponDto
} from '../presentation/dto/promotion.dto.js';

type PricingCartItem = {
  skuId: string;
  productId: string;
  productName: string;
  skuName: string;
  unitPriceCents: number;
  currency: string;
  quantity: number;
  lineTotalCents: number;
  product: {
    id: string;
    brand: string | null;
    category: string | null;
  };
};

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async listAdminPromotions(tenantId: string) {
    const promotions = await this.prisma.promotion.findMany({
      where: { tenantId },
      include: { coupons: { orderBy: { code: 'asc' } } },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }]
    });

    return promotions.map((promotion) => this.toPromotionSummary(promotion));
  }

  async createPromotion(actor: AuthenticatedUser, tenantId: string, dto: CreatePromotionDto) {
    this.ensurePromotionDates(dto.startsAt, dto.endsAt);
    this.ensureDiscountValue(dto.discountType, dto.discountValue);

    const promotion = await this.prisma.promotion.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        status: dto.status ?? PromotionStatus.draft,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        targetType: dto.targetType ?? PromotionTargetType.all_products,
        targetProductIds: dto.targetProductIds ?? [],
        targetCategories: this.normalizeList(dto.targetCategories),
        targetBrands: this.normalizeList(dto.targetBrands),
        targetCustomerIds: dto.targetCustomerIds ?? [],
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        usageLimit: dto.usageLimit ?? null,
        perCustomerLimit: dto.perCustomerLimit ?? null,
        minimumOrderAmountCents: dto.minimumOrderAmountCents ?? null,
        stackable: dto.stackable ?? false,
        coupons: {
          create: (dto.couponCodes ?? []).map((coupon) => ({
            tenantId,
            code: this.normalizeCode(coupon.code),
            active: coupon.active ?? true,
            usageLimit: coupon.usageLimit ?? null
          }))
        }
      },
      include: { coupons: true }
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A coupon with this code already exists.');
      }
      throw error;
    });

    await this.writeAuditAndEvent(actor.id, tenantId, 'promotion.created', promotion.id, domainEvents.promotionCreated);
    return this.toPromotionSummary(promotion);
  }

  async updatePromotion(actor: AuthenticatedUser, tenantId: string, promotionId: string, dto: UpdatePromotionDto) {
    await this.ensurePromotionBelongsToTenant(tenantId, promotionId);
    this.ensurePromotionDates(dto.startsAt, dto.endsAt);
    if (dto.discountType && dto.discountValue !== undefined) {
      this.ensureDiscountValue(dto.discountType, dto.discountValue);
    }

    const promotion = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.promotion.update({
        where: { id: promotionId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.discountType !== undefined ? { discountType: dto.discountType } : {}),
          ...(dto.discountValue !== undefined ? { discountValue: dto.discountValue } : {}),
          ...(dto.targetType !== undefined ? { targetType: dto.targetType } : {}),
          ...(dto.targetProductIds !== undefined ? { targetProductIds: dto.targetProductIds } : {}),
          ...(dto.targetCategories !== undefined ? { targetCategories: this.normalizeList(dto.targetCategories) } : {}),
          ...(dto.targetBrands !== undefined ? { targetBrands: this.normalizeList(dto.targetBrands) } : {}),
          ...(dto.targetCustomerIds !== undefined ? { targetCustomerIds: dto.targetCustomerIds } : {}),
          ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null } : {}),
          ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null } : {}),
          ...(dto.usageLimit !== undefined ? { usageLimit: dto.usageLimit } : {}),
          ...(dto.perCustomerLimit !== undefined ? { perCustomerLimit: dto.perCustomerLimit } : {}),
          ...(dto.minimumOrderAmountCents !== undefined ? { minimumOrderAmountCents: dto.minimumOrderAmountCents } : {}),
          ...(dto.stackable !== undefined ? { stackable: dto.stackable } : {})
        }
      });

      if (dto.couponCodes) {
        const normalizedCodes = dto.couponCodes.map((coupon) => this.normalizeCode(coupon.code));
        await tx.couponCode.updateMany({
          where: {
            promotionId,
            code: { notIn: normalizedCodes }
          },
          data: { active: false }
        });
        for (const coupon of dto.couponCodes) {
          const code = this.normalizeCode(coupon.code);
          await tx.couponCode.upsert({
            where: {
              tenantId_code: {
                tenantId,
                code
              }
            },
            update: {
              promotionId,
              active: coupon.active ?? true,
              usageLimit: coupon.usageLimit ?? null
            },
            create: {
              tenantId,
              promotionId,
              code,
              active: coupon.active ?? true,
              usageLimit: coupon.usageLimit ?? null
            }
          });
        }
      }

      return tx.promotion.findUniqueOrThrow({
        where: { id: updated.id },
        include: { coupons: { orderBy: { code: 'asc' } } }
      });
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A coupon with this code already exists.');
      }
      throw error;
    });

    await this.writeAuditAndEvent(actor.id, tenantId, 'promotion.updated', promotion.id, domainEvents.promotionUpdated);
    return this.toPromotionSummary(promotion);
  }

  async archivePromotion(actor: AuthenticatedUser, tenantId: string, promotionId: string) {
    await this.ensurePromotionBelongsToTenant(tenantId, promotionId);
    const promotion = await this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        status: PromotionStatus.archived,
        archivedAt: new Date()
      },
      include: { coupons: true }
    });

    await this.writeAuditAndEvent(actor.id, tenantId, 'promotion.archived', promotion.id, domainEvents.promotionArchived);
    return this.toPromotionSummary(promotion);
  }

  async validateCouponForCurrentCart(
    tenantId: string,
    sessionId: string,
    dto: ValidateCouponDto,
    user?: AuthenticatedUser,
  ): Promise<CouponValidationSummary> {
    const cart = await this.prisma.cart.findFirst({
      where: {
        tenantId,
        OR: [
          ...(user?.userType === 'customer' ? [{ userId: user.id }] : []),
          { sessionId }
        ]
      },
      include: {
        items: {
          include: {
            sku: { include: { product: true } }
          }
        }
      }
    });

    const items = (cart?.items ?? []).map((item) => ({
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

    const result = await this.calculateCouponDiscount({
      tenantId,
      code: dto.code,
      items,
      ...(user?.userType === 'customer' ? { userId: user.id, customerEmail: user.email } : {}),
      ...((!user || user.userType !== 'customer') && dto.email ? { customerEmail: dto.email } : {})
    });

    await this.outbox.enqueue({
      id: randomUUID(),
      name: domainEvents.couponValidated,
      tenantId,
      aggregateId: result.promotionId ?? tenantId,
      payload: { code: this.normalizeCode(dto.code), valid: result.valid },
      occurredAt: new Date().toISOString()
    });

    return result.summary;
  }

  async calculateCouponDiscount(input: {
    tenantId: string;
    code?: string;
    items: PricingCartItem[];
    userId?: string;
    customerEmail?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const subtotalCents = input.items.reduce((total, item) => total + item.lineTotalCents, 0);
    const currency = input.items[0]?.currency ?? 'USD';
    const empty = {
      valid: false,
      promotionId: null as string | null,
      couponCodeId: null as string | null,
      discountCents: 0,
      summary: {
        valid: false,
        code: input.code ? this.normalizeCode(input.code) : '',
        message: input.code ? 'Coupon could not be applied.' : 'No coupon applied.',
        subtotalCents,
        discountCents: 0,
        totalCents: subtotalCents,
        currency,
        discountLines: []
      }
    };

    if (!input.code?.trim()) {
      return empty;
    }
    if (input.items.length === 0) {
      return { ...empty, summary: { ...empty.summary, message: 'Cart is empty.' } };
    }

    const prisma = input.tx ?? this.prisma;
    const code = this.normalizeCode(input.code);
    const coupon = await prisma.couponCode.findFirst({
      where: { tenantId: input.tenantId, code, active: true },
      include: { promotion: true }
    });
    if (!coupon || coupon.promotion.status !== PromotionStatus.active) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Coupon is not active.' } };
    }

    const now = new Date();
    const promotion = coupon.promotion;
    if ((promotion.startsAt && promotion.startsAt > now) || (promotion.endsAt && promotion.endsAt < now)) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Coupon is not available now.' } };
    }
    if (promotion.minimumOrderAmountCents && subtotalCents < promotion.minimumOrderAmountCents) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Cart total is too low for this coupon.' } };
    }

    const eligibleSubtotalCents = this.calculateEligibleSubtotal(promotion, input.items);
    if (promotion.targetType === PromotionTargetType.customers && !this.customerIsTargeted(promotion, input.userId)) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Coupon is not available for this customer.' } };
    }
    if (eligibleSubtotalCents <= 0) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Coupon does not match these snacks.' } };
    }

    const usageCount = await prisma.promotionRedemption.count({ where: { tenantId: input.tenantId, promotionId: promotion.id } });
    const couponUsageCount = await prisma.promotionRedemption.count({ where: { tenantId: input.tenantId, couponCodeId: coupon.id } });
    if ((promotion.usageLimit && usageCount >= promotion.usageLimit) || (coupon.usageLimit && couponUsageCount >= coupon.usageLimit)) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Coupon has reached its limit.' } };
    }

    const customerWhere = this.customerRedemptionWhere(input.tenantId, promotion.id, input.userId, input.customerEmail);
    if (promotion.perCustomerLimit && customerWhere) {
      const perCustomerCount = await prisma.promotionRedemption.count({ where: customerWhere });
      if (perCustomerCount >= promotion.perCustomerLimit) {
        return { ...empty, summary: { ...empty.summary, code, message: 'Coupon was already used.' } };
      }
    }
    if (promotion.discountType === PromotionDiscountType.first_order) {
      const hasOrder = await this.hasPriorOrder(input.tenantId, input.userId, input.customerEmail, prisma);
      if (hasOrder) {
        return { ...empty, summary: { ...empty.summary, code, message: 'Coupon is for first orders only.' } };
      }
    }

    const discountCents = Math.min(
      subtotalCents,
      this.calculateDiscountCents(promotion.discountType, promotion.discountValue, eligibleSubtotalCents),
    );

    if (discountCents <= 0) {
      return { ...empty, summary: { ...empty.summary, code, message: 'Coupon does not reduce this cart.' } };
    }

    return {
      valid: true,
      promotionId: promotion.id,
      couponCodeId: coupon.id,
      discountCents,
      summary: {
        valid: true,
        code,
        message: 'Coupon applied.',
        subtotalCents,
        discountCents,
        totalCents: subtotalCents - discountCents,
        currency,
        discountLines: [{ code, label: promotion.name, amountCents: discountCents }]
      }
    };
  }

  async recordRedemption(input: {
    tx: Prisma.TransactionClient;
    tenantId: string;
    promotionId: string;
    couponCodeId: string | null;
    orderId: string;
    userId?: string;
    customerEmail?: string;
    discountCents: number;
    snapshot: Prisma.InputJsonValue;
  }) {
    const redemption = await input.tx.promotionRedemption.create({
      data: {
        tenantId: input.tenantId,
        promotionId: input.promotionId,
        couponCodeId: input.couponCodeId,
        orderId: input.orderId,
        ...(input.userId ? { userId: input.userId } : {}),
        ...(input.customerEmail ? { customerEmail: input.customerEmail.trim().toLowerCase() } : {}),
        discountCents: input.discountCents,
        metadata: input.snapshot
      }
    });
    await input.tx.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        aggregateId: redemption.id,
        name: domainEvents.couponRedeemed,
        payload: {
          promotionId: input.promotionId,
          couponCodeId: input.couponCodeId,
          orderId: input.orderId,
          discountCents: input.discountCents
        }
      }
    });
  }

  private calculateEligibleSubtotal(promotion: PromotionRecord, items: PricingCartItem[]) {
    if (promotion.targetType === PromotionTargetType.all_products || promotion.targetType === PromotionTargetType.customers) {
      return items.reduce((total, item) => total + item.lineTotalCents, 0);
    }
    return items.reduce((total, item) => {
      const eligible =
        (promotion.targetType === PromotionTargetType.products && promotion.targetProductIds.includes(item.productId)) ||
        (promotion.targetType === PromotionTargetType.categories &&
          item.product.category !== null &&
          promotion.targetCategories.map((category) => category.toLowerCase()).includes(item.product.category.toLowerCase())) ||
        (promotion.targetType === PromotionTargetType.brands &&
          item.product.brand !== null &&
          promotion.targetBrands.map((brand) => brand.toLowerCase()).includes(item.product.brand.toLowerCase()));
      return eligible ? total + item.lineTotalCents : total;
    }, 0);
  }

  private customerIsTargeted(promotion: PromotionRecord, userId?: string) {
    return Boolean(userId && promotion.targetCustomerIds.includes(userId));
  }

  private calculateDiscountCents(type: PromotionDiscountType, value: number, eligibleSubtotalCents: number) {
    if (type === PromotionDiscountType.percentage || type === PromotionDiscountType.first_order) {
      return Math.floor((eligibleSubtotalCents * value) / 100);
    }
    if (type === PromotionDiscountType.fixed_amount || type === PromotionDiscountType.bundle) {
      return Math.min(value, eligibleSubtotalCents);
    }
    return 0;
  }

  private customerRedemptionWhere(tenantId: string, promotionId: string, userId?: string, customerEmail?: string) {
    if (userId) {
      return { tenantId, promotionId, userId };
    }
    if (customerEmail) {
      return { tenantId, promotionId, customerEmail: customerEmail.trim().toLowerCase() };
    }
    return null;
  }

  private async hasPriorOrder(
    tenantId: string,
    userId: string | undefined,
    customerEmail: string | undefined,
    prisma: Prisma.TransactionClient | PrismaService,
  ) {
    if (userId) {
      return (await prisma.order.count({ where: { tenantId, userId } })) > 0;
    }
    if (!customerEmail) {
      return false;
    }
    return (
      (await prisma.order.count({
        where: {
          tenantId,
          customer: {
            path: ['email'],
            equals: customerEmail.trim().toLowerCase()
          }
        }
      })) > 0
    );
  }

  private ensureDiscountValue(type: string, value: number) {
    if (type === 'percentage' || type === 'first_order') {
      if (value <= 0 || value > 100) {
        throw new BadRequestException('Percentage discounts must be between 1 and 100.');
      }
      return;
    }
    if (type === 'free_shipping') {
      return;
    }
    if (value <= 0) {
      throw new BadRequestException('Discount amount must be greater than zero.');
    }
  }

  private ensurePromotionDates(startsAt?: string, endsAt?: string) {
    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      throw new BadRequestException('Start date must be before end date.');
    }
  }

  private async ensurePromotionBelongsToTenant(tenantId: string, promotionId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id: promotionId, tenantId },
      select: { id: true }
    });
    if (!promotion) {
      throw new NotFoundException('Promotion was not found.');
    }
  }

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private normalizeList(values: string[] | undefined) {
    return (values ?? []).map((value) => value.trim()).filter(Boolean);
  }

  private async writeAuditAndEvent(
    actorId: string,
    tenantId: string,
    action: string,
    target: string,
    eventName: (typeof domainEvents)[keyof typeof domainEvents],
  ) {
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId,
        action,
        target,
        metadata: { target }
      }
    });
    await this.outbox.enqueue({
      id: randomUUID(),
      name: eventName,
      tenantId,
      aggregateId: target,
      payload: { promotionId: target },
      occurredAt: new Date().toISOString()
    });
  }

  private toPromotionSummary(promotion: PromotionWithCoupons) {
    return {
      id: promotion.id,
      tenantId: promotion.tenantId,
      name: promotion.name,
      description: promotion.description,
      status: promotion.status,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      targetType: promotion.targetType,
      targetProductIds: promotion.targetProductIds,
      targetCategories: promotion.targetCategories,
      targetBrands: promotion.targetBrands,
      targetCustomerIds: promotion.targetCustomerIds,
      startsAt: promotion.startsAt?.toISOString() ?? null,
      endsAt: promotion.endsAt?.toISOString() ?? null,
      usageLimit: promotion.usageLimit,
      perCustomerLimit: promotion.perCustomerLimit,
      minimumOrderAmountCents: promotion.minimumOrderAmountCents,
      stackable: promotion.stackable,
      couponCodes: promotion.coupons.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        active: coupon.active,
        usageLimit: coupon.usageLimit
      })),
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
      archivedAt: promotion.archivedAt?.toISOString() ?? null
    };
  }

  private isUniqueError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}

type PromotionWithCoupons = Prisma.PromotionGetPayload<{ include: { coupons: true } }>;
type PromotionRecord = Promotion;
