import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  domainEvents,
  type BundlePreviewSummary,
  type GroupCartSummary,
  type LoyaltySummary,
  type SnackPlanSummary
} from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import { LoyaltyLedgerType, ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import type { AddGroupCartItemDto, CreateBundlePreviewDto, CreateGroupCartDto, CreateSnackPlanDto } from '../presentation/dto/loyalty-foundations.dto.js';

const productPreviewInclude = {
  skus: {
    where: { active: true },
    orderBy: { priceCents: 'asc' as const },
    take: 1
  },
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 }
} as const;

@Injectable()
export class LoyaltyFoundationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLoyalty(tenantId: string, user: AuthenticatedUser): Promise<LoyaltySummary> {
    await this.ensureDefaultQuests(tenantId);
    const [ledger, quests] = await Promise.all([
      this.prisma.loyaltyLedgerEntry.findMany({
        where: { tenantId, userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 12
      }),
      this.prisma.loyaltyQuest.findMany({
        where: {
          tenantId,
          active: true,
          OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }]
        },
        include: { progress: { where: { userId: user.id } } },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const pointsBalance = ledger.reduce((total, entry) => total + entry.points, 0);
    const questSummaries = await Promise.all(quests.map(async (quest) => {
      const progress = quest.progress[0];
      const derivedProgress = await this.calculateQuestProgress(tenantId, user.id, quest.goalType);
      const current = Math.max(progress?.progress ?? 0, derivedProgress);
      if (!progress || progress.progress < current) {
        await this.prisma.loyaltyQuestProgress.upsert({
          where: { questId_userId: { questId: quest.id, userId: user.id } },
          update: {
            progress: current,
            ...(current >= quest.goalTarget ? { completedAt: progress?.completedAt ?? new Date() } : {})
          },
          create: {
            tenantId,
            questId: quest.id,
            userId: user.id,
            progress: current,
            ...(current >= quest.goalTarget ? { completedAt: new Date() } : {})
          }
        });
      }
      return {
        id: quest.id,
        name: quest.name,
        description: quest.description,
        goalType: quest.goalType,
        goalTarget: quest.goalTarget,
        progress: current,
        rewardPoints: quest.rewardPoints,
        completed: current >= quest.goalTarget || Boolean(progress?.completedAt),
        rewardClaimed: Boolean(progress?.rewardClaimedAt)
      };
    }));

    return {
      pointsBalance,
      quests: questSummaries,
      ledger: ledger.map((entry) => ({
        id: entry.id,
        points: entry.points,
        type: entry.type,
        reason: entry.reason,
        createdAt: entry.createdAt.toISOString()
      }))
    };
  }

  async claimQuestReward(tenantId: string, user: AuthenticatedUser, questId: string) {
    const quest = await this.prisma.loyaltyQuest.findFirst({ where: { id: questId, tenantId, active: true } });
    if (!quest) throw new NotFoundException('Quest was not found.');

    const currentProgress = await this.calculateQuestProgress(tenantId, user.id, quest.goalType);
    const progress = await this.prisma.loyaltyQuestProgress.upsert({
      where: { questId_userId: { questId, userId: user.id } },
      update: {
        progress: currentProgress,
        ...(currentProgress >= quest.goalTarget ? { completedAt: new Date() } : {})
      },
      create: {
        tenantId,
        questId,
        userId: user.id,
        progress: currentProgress,
        ...(currentProgress >= quest.goalTarget ? { completedAt: new Date() } : {})
      }
    });

    if (progress.rewardClaimedAt) {
      throw new BadRequestException('Reward was already claimed.');
    }
    if ((progress.progress ?? 0) < quest.goalTarget && !progress.completedAt) {
      throw new BadRequestException('Quest is not complete yet.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.loyaltyQuestProgress.update({
        where: { id: progress.id },
        data: { rewardClaimedAt: new Date(), completedAt: progress.completedAt ?? new Date() }
      });
      await tx.loyaltyLedgerEntry.create({
        data: {
          tenantId,
          userId: user.id,
          points: quest.rewardPoints,
          type: LoyaltyLedgerType.earned,
          reason: `Quest reward: ${quest.name}`,
          metadata: { questId }
        }
      });
      await this.writeOutbox(tx, tenantId, quest.id, domainEvents.loyaltyRewardClaimed, { questId, userId: user.id });
    });

    return this.getLoyalty(tenantId, user);
  }

  async createBundlePreview(tenantId: string, dto: CreateBundlePreviewDto): Promise<BundlePreviewSummary> {
    const template = dto.templateId
      ? await this.prisma.bundleTemplate.findFirst({ where: { id: dto.templateId, tenantId, status: 'active' } })
      : await this.ensureDefaultBundleTemplate(tenantId);
    if (!template) throw new NotFoundException('Bundle template was not found.');

    const products = await this.findSuggestionProducts(tenantId, template.preferredCategories, template.preferredTags, template.maxItems);
    const items = products.flatMap((product) => {
      const sku = product.skus[0];
      if (!sku) return [];
      const quantity = Math.max(1, Math.min(2, Math.ceil((dto.participantCount ?? 1) / 8)));
      return [{
        productId: product.id,
        skuId: sku.id,
        productName: product.name,
        skuName: sku.name,
        quantity,
        unitPriceCents: sku.priceCents,
        lineTotalCents: sku.priceCents * quantity
      }];
    });
    const subtotalCents = items.reduce((total, item) => total + item.lineTotalCents, 0);
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId: template.id,
        name: domainEvents.bundlePreviewGenerated,
        payload: { templateId: template.id, subtotalCents }
      }
    });
    return {
      templateId: template.id,
      title: template.name,
      subtotalCents,
      currency: products[0]?.skus[0]?.currency ?? 'USD',
      items
    };
  }

  async createSnackPlan(tenantId: string, user: AuthenticatedUser | undefined, dto: CreateSnackPlanDto): Promise<SnackPlanSummary> {
    const products = await this.findSuggestionProducts(tenantId, dto.preferredCategories ?? [], dto.preferredTags ?? [], 8);
    const suggestion = {
      items: products.map((product) => {
        const sku = product.skus[0];
        return {
          productId: product.id,
          skuId: sku?.id,
          productName: product.name,
          skuName: sku?.name,
          quantity: Math.max(1, Math.ceil(dto.participantCount / 10)),
          unitPriceCents: sku?.priceCents ?? 0
        };
      }).filter((item) => item.skuId)
    };
    const plan = await this.prisma.snackPlan.create({
      data: {
        tenantId,
        ...(user?.userType === 'customer' ? { userId: user.id } : {}),
        name: dto.name.trim(),
        participantCount: dto.participantCount,
        budgetTargetCents: dto.budgetTargetCents,
        preferredCategories: dto.preferredCategories ?? [],
        preferredTags: dto.preferredTags ?? [],
        status: 'generated',
        suggestion
      }
    });
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId: plan.id,
        name: domainEvents.snackPlanGenerated,
        payload: { planId: plan.id, participantCount: plan.participantCount }
      }
    });
    return this.toSnackPlan(plan);
  }

  async createGroupCart(tenantId: string, user: AuthenticatedUser | undefined, dto: CreateGroupCartDto): Promise<GroupCartSummary> {
    if (user?.userType !== 'customer') throw new BadRequestException('Sign in to create a group cart.');
    const groupCart = await this.prisma.groupCart.create({
      data: {
        tenantId,
        ownerUserId: user.id,
        name: dto.name.trim(),
        shareToken: randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      include: this.groupCartInclude()
    });
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId: groupCart.id,
        name: domainEvents.groupCartCreated,
        payload: { groupCartId: groupCart.id }
      }
    });
    return this.toGroupCart(groupCart);
  }

  async getMyGroupCarts(tenantId: string, user: AuthenticatedUser | undefined) {
    if (user?.userType !== 'customer') return [];
    const carts = await this.prisma.groupCart.findMany({
      where: {
        tenantId,
        ownerUserId: user.id
      },
      include: this.groupCartInclude(),
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return carts.map((cart) => this.toGroupCart(cart));
  }

  async addGroupCartItem(tenantId: string, user: AuthenticatedUser | undefined, groupCartId: string, dto: AddGroupCartItemDto): Promise<GroupCartSummary> {
    if (user?.userType !== 'customer') throw new BadRequestException('Sign in to add group cart items.');
    const groupCart = await this.prisma.groupCart.findFirst({ where: { id: groupCartId, tenantId, status: 'open', ownerUserId: user.id } });
    if (!groupCart) throw new NotFoundException('Group cart was not found.');
    const sku = await this.prisma.sku.findFirst({
      where: { id: dto.skuId, tenantId, active: true, product: { status: ProductStatus.active } },
      select: { id: true }
    });
    if (!sku) throw new BadRequestException('This snack is not available for group carts.');

    const participant = dto.participantName
      ? await this.prisma.groupCartParticipant.create({
          data: {
            groupCartId,
            name: dto.participantName.trim(),
            ...(dto.participantEmail ? { email: dto.participantEmail.trim().toLowerCase() } : {})
          }
        })
      : null;
    await this.prisma.groupCartItem.create({
      data: {
        groupCartId,
        ...(participant?.id ? { participantId: participant.id } : {}),
        skuId: dto.skuId,
        quantity: dto.quantity,
        note: dto.note?.trim() || null
      }
    });
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId: groupCartId,
        name: domainEvents.groupCartItemAdded,
        payload: { groupCartId, skuId: dto.skuId, quantity: dto.quantity }
      }
    });
    const updated = await this.prisma.groupCart.findUniqueOrThrow({ where: { id: groupCartId }, include: this.groupCartInclude() });
    return this.toGroupCart(updated);
  }

  async mergeGroupCart(tenantId: string, groupCartId: string, sessionId: string, user: AuthenticatedUser | undefined): Promise<GroupCartSummary> {
    if (user?.userType !== 'customer') throw new BadRequestException('Sign in to copy a group cart.');
    const groupCart = await this.prisma.groupCart.findFirst({
      where: { id: groupCartId, tenantId, status: 'open', ownerUserId: user.id },
      include: { items: true }
    });
    if (!groupCart) throw new NotFoundException('Group cart was not found.');

    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { id: groupCart.cartId ?? randomUUID() },
        update: {},
        create: {
          tenantId,
          sessionId,
          userId: user.id
        }
      }).catch(async () => tx.cart.create({
        data: {
          tenantId,
          sessionId,
          userId: user.id
        }
      }));
      for (const item of groupCart.items) {
        await tx.cartItem.upsert({
          where: { cartId_skuId: { cartId: cart.id, skuId: item.skuId } },
          update: { quantity: { increment: item.quantity } },
          create: { cartId: cart.id, skuId: item.skuId, quantity: item.quantity }
        });
      }
      await tx.groupCart.update({ where: { id: groupCart.id }, data: { status: 'merged', cartId: cart.id } });
      await this.writeOutbox(tx, tenantId, groupCart.id, domainEvents.groupCartMerged, { groupCartId, cartId: cart.id });
    });

    const updated = await this.prisma.groupCart.findUniqueOrThrow({ where: { id: groupCartId }, include: this.groupCartInclude() });
    return this.toGroupCart(updated);
  }

  private async ensureDefaultQuests(tenantId: string) {
    await this.prisma.loyaltyQuest.upsert({
      where: { id: `default-first-order-${tenantId}` },
      update: {},
      create: {
        id: `default-first-order-${tenantId}`,
        tenantId,
        name: 'First snack run',
        description: 'Complete your first order to earn points.',
        goalType: 'order_count',
        goalTarget: 1,
        rewardPoints: 50,
        active: true
      }
    });
  }

  private async calculateQuestProgress(tenantId: string, userId: string, goalType: string) {
    if (goalType === 'order_count') {
      return this.prisma.order.count({ where: { tenantId, userId } });
    }
    if (goalType === 'spend_amount') {
      const aggregate = await this.prisma.order.aggregate({
        where: { tenantId, userId },
        _sum: { totalCents: true }
      });
      return aggregate._sum.totalCents ?? 0;
    }
    return 0;
  }

  private async ensureDefaultBundleTemplate(tenantId: string) {
    return this.prisma.bundleTemplate.upsert({
      where: { id: `default-office-bundle-${tenantId}` },
      update: { status: 'active' },
      create: {
        id: `default-office-bundle-${tenantId}`,
        tenantId,
        name: 'Office snack starter',
        description: 'A simple mix of available snacks for a small team.',
        status: 'active',
        minItems: 2,
        maxItems: 5,
        preferredCategories: []
      }
    });
  }

  private async findSuggestionProducts(tenantId: string, categories: string[], tags: string[], take: number) {
    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        status: ProductStatus.active,
        skus: { some: { active: true } },
        ...(categories.length
          ? { OR: categories.map((category) => ({ category: { equals: category, mode: 'insensitive' as const } })) }
          : {})
      },
      include: productPreviewInclude,
      orderBy: { updatedAt: 'desc' },
      take: Math.max(1, take)
    });
    if (!tags.length) return products;
    const lowerTags = tags.map((tag) => tag.toLowerCase());
    return products.filter((product) => {
      const metadata = product.metadata;
      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false;
      const rawTags = (metadata as Record<string, unknown>).tags;
      return Array.isArray(rawTags) && rawTags.some((tag) => typeof tag === 'string' && lowerTags.includes(tag.toLowerCase()));
    });
  }

  private toSnackPlan(plan: { id: string; name: string; participantCount: number; budgetTargetCents: number; preferredCategories: string[]; preferredTags: string[]; status: string; suggestion: Prisma.JsonValue; createdAt: Date }): SnackPlanSummary {
    return {
      id: plan.id,
      name: plan.name,
      participantCount: plan.participantCount,
      budgetTargetCents: plan.budgetTargetCents,
      preferredCategories: plan.preferredCategories,
      preferredTags: plan.preferredTags,
      status: plan.status,
      suggestion: plan.suggestion,
      createdAt: plan.createdAt.toISOString()
    };
  }

  private groupCartInclude() {
    return {
      items: {
        include: {
          participant: true,
          sku: { include: { product: true } }
        },
        orderBy: { createdAt: 'asc' as const }
      }
    } as const;
  }

  private toGroupCart(cart: Prisma.GroupCartGetPayload<{ include: ReturnType<LoyaltyFoundationsService['groupCartInclude']> }>): GroupCartSummary {
    return {
      id: cart.id,
      name: cart.name,
      shareToken: cart.shareToken,
      status: cart.status,
      createdAt: cart.createdAt.toISOString(),
      items: cart.items.map((item) => ({
        id: item.id,
        skuId: item.skuId,
        productName: item.sku.product.name,
        skuName: item.sku.name,
        quantity: item.quantity,
        participantName: item.participant?.name ?? null
      }))
    };
  }

  private async writeOutbox(tx: Prisma.TransactionClient, tenantId: string, aggregateId: string, name: (typeof domainEvents)[keyof typeof domainEvents], payload: Record<string, unknown>) {
    await tx.outboxEvent.create({
      data: { id: randomUUID(), tenantId, aggregateId, name, payload: payload as Prisma.InputJsonObject }
    });
  }
}
