import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  domainEvents,
  type StorefrontAvailabilityStatus,
  type StorefrontCollection,
  type StorefrontProductCard,
  type StorefrontProductDetail,
  type StorefrontProductList,
  type StorefrontRecommendationSection,
  type StorefrontSkuSummary
} from '@snacks/shared';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { OpenSearchService } from '../../../infrastructure/search/opensearch.service.js';
import { StorefrontPolicy } from '../domain/storefront-policy.js';
import type { StorefrontProductListQueryDto } from '../presentation/dto/storefront-query.dto.js';

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  skus: {
    where: { active: true },
    orderBy: { priceCents: 'asc' as const },
    include: {
      batches: {
        where: {
          expiredAt: null
        },
        select: {
          quantity: true,
          reserved: true,
          expiresAt: true,
          expiredAt: true
        }
      }
    }
  }
} as const;

type StorefrontProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class StorefrontService {
  private readonly logger = new Logger(StorefrontService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openSearch: OpenSearchService,
  ) {}

  async listProducts(tenantId: string, query: StorefrontProductListQueryDto): Promise<StorefrontProductList> {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const products = await this.findProducts(resolvedTenantId, query);
    return this.paginateAndMap(products, query);
  }

  async searchProducts(tenantId: string, query: StorefrontProductListQueryDto): Promise<StorefrontProductList> {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    if (!query.q) {
      return this.listProducts(resolvedTenantId, query);
    }

    try {
      const ids = await this.openSearch.searchProductIds({
        tenantId: resolvedTenantId,
        query: query.q,
        limit: Math.min(query.page * query.pageSize, 100)
      });
      if (ids.length > 0) {
        const products = await this.prisma.product.findMany({
          where: {
            id: { in: ids },
            tenantId: resolvedTenantId,
            status: ProductStatus.active
          },
          include: productInclude
        });
        const orderedProducts = ids
          .map((id) => products.find((product) => product.id === id))
          .filter((product): product is StorefrontProductRecord => Boolean(product));
        return this.paginateAndMap(this.applyNonSearchFilters(orderedProducts, query), query);
      }
    } catch (error) {
      this.logger.warn(`OpenSearch storefront search failed. Falling back to PostgreSQL. ${String(error)}`);
    }

    return this.listProducts(resolvedTenantId, query);
  }

  async getProductBySlug(tenantId: string, slug: string): Promise<StorefrontProductDetail> {
    StorefrontPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const product = StorefrontPolicy.ensureFound(
      await this.prisma.product.findFirst({
        where: {
          tenantId: resolvedTenantId,
          slug,
          status: ProductStatus.active,
          skus: { some: { active: true } }
        },
        include: productInclude
      }),
    );

    await this.writeProductViewed(resolvedTenantId, product.id);
    return this.toProductDetail(product);
  }

  async listCollections(tenantId: string): Promise<StorefrontCollection[]> {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const products = await this.prisma.product.findMany({
      where: {
        tenantId: resolvedTenantId,
        status: ProductStatus.active,
        category: { not: null }
      },
      select: { category: true }
    });
    const counts = new Map<string, number>();
    for (const product of products) {
      if (product.category) {
        counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, count]) => ({ key: this.slugify(label), label, count }));
  }

  async listRecommendations(tenantId: string): Promise<StorefrontRecommendationSection[]> {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const popular = await this.findProducts(resolvedTenantId, { page: 1, pageSize: 8, sort: 'popular' });
    const fresh = await this.findProducts(resolvedTenantId, { page: 1, pageSize: 8, sort: 'newest' });
    const bundleReady = await this.findProducts(resolvedTenantId, {
      page: 1,
      pageSize: 8,
      sort: 'newest',
      tag: 'bundle'
    });

    return [
      { key: 'popular', title: 'Popular snacks', items: this.paginateAndMap(popular, { page: 1, pageSize: 8 }).items },
      { key: 'fresh', title: 'Fresh picks', items: this.paginateAndMap(fresh, { page: 1, pageSize: 8 }).items },
      {
        key: 'dynamic-bundles',
        title: 'Bundle ideas',
        items: this.paginateAndMap(bundleReady.length > 0 ? bundleReady : popular, { page: 1, pageSize: 8 }).items
      }
    ];
  }

  private async findProducts(tenantId: string, query: Partial<StorefrontProductListQueryDto>) {
    const where: Prisma.ProductWhereInput = {
      tenantId,
      status: ProductStatus.active,
      skus: { some: { active: true } },
      ...(query.category ? { category: { equals: query.category, mode: 'insensitive' } } : {}),
      ...(query.brand ? { brand: { equals: query.brand, mode: 'insensitive' } } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { brand: { contains: query.q, mode: 'insensitive' } },
              { category: { contains: query.q, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const products = await this.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: this.orderBy(query.sort),
      take: 200
    });

    return this.applyNonSearchFilters(products, query);
  }

  private applyNonSearchFilters(products: StorefrontProductRecord[], query: Partial<StorefrontProductListQueryDto>) {
    if (!query.tag) {
      return products;
    }
    const tag = query.tag.toLowerCase();
    return products.filter((product) => this.stringArrayFromMetadata(product.metadata, 'tags').includes(tag));
  }

  private paginateAndMap(
    products: StorefrontProductRecord[],
    query: Partial<StorefrontProductListQueryDto>,
  ): StorefrontProductList {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const sorted = this.sortByDerivedFields(products, query.sort);
    const items = sorted.slice((page - 1) * pageSize, page * pageSize).map((product) => this.toProductCard(product));
    return {
      items,
      page,
      pageSize,
      total: sorted.length
    };
  }

  private sortByDerivedFields(products: StorefrontProductRecord[], sort = 'newest') {
    if (sort === 'price_asc') {
      return [...products].sort((left, right) => this.startingPrice(left) - this.startingPrice(right));
    }
    if (sort === 'price_desc') {
      return [...products].sort((left, right) => this.startingPrice(right) - this.startingPrice(left));
    }
    if (sort === 'popular') {
      return [...products].sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
    }
    return products;
  }

  private orderBy(sort: string | undefined): Prisma.ProductOrderByWithRelationInput {
    if (sort === 'name_asc') {
      return { name: 'asc' };
    }
    return { createdAt: 'desc' };
  }

  private toProductDetail(product: StorefrontProductRecord): StorefrontProductDetail {
    const card = this.toProductCard(product);
    return {
      ...card,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder
      })),
      skus: product.skus.map((sku) => this.toSkuSummary(sku))
    };
  }

  private toProductCard(product: StorefrontProductRecord): StorefrontProductCard {
    const skus = product.skus.map((sku) => this.toSkuSummary(sku));
    const availableQuantity = skus.reduce((total, sku) => total + sku.availableQuantity, 0);
    const image = product.images[0];
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: product.brand ?? this.textFromMetadata(product.metadata, 'brand'),
      category: product.category ?? this.textFromMetadata(product.metadata, 'category'),
      tags: this.stringArrayFromMetadata(product.metadata, 'tags'),
      dietaryLabels: this.stringArrayFromMetadata(product.metadata, 'dietaryLabels'),
      isPerishable: this.booleanFromMetadata(product.metadata, 'isPerishable'),
      flavor: this.textFromMetadata(product.metadata, 'flavor'),
      occasion: this.textFromMetadata(product.metadata, 'occasion'),
      image: image
        ? {
            id: image.id,
            url: image.url,
            alt: image.alt,
            sortOrder: image.sortOrder
          }
        : null,
      startingPriceCents: skus.length > 0 ? Math.min(...skus.map((sku) => sku.priceCents)) : null,
      currency: skus[0]?.currency ?? 'USD',
      availability: this.availabilityFromQuantity(availableQuantity),
      availableQuantity,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  }

  private toSkuSummary(sku: StorefrontProductRecord['skus'][number]): StorefrontSkuSummary {
    const now = Date.now();
    const availableQuantity = sku.batches.reduce((total, batch) => {
      if (batch.expiredAt || (batch.expiresAt && batch.expiresAt.getTime() <= now)) {
        return total;
      }
      return total + Math.max(0, batch.quantity - batch.reserved);
    }, 0);
    return {
      id: sku.id,
      name: sku.name,
      priceCents: sku.priceCents,
      currency: sku.currency,
      active: sku.active,
      availableQuantity,
      availability: this.availabilityFromQuantity(availableQuantity)
    };
  }

  private availabilityFromQuantity(quantity: number): StorefrontAvailabilityStatus {
    if (quantity <= 0) {
      return 'out_of_stock';
    }
    if (quantity <= 5) {
      return 'low_stock';
    }
    return 'in_stock';
  }

  private startingPrice(product: StorefrontProductRecord) {
    const prices = product.skus.map((sku) => sku.priceCents);
    return prices.length > 0 ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    StorefrontPolicy.ensureTenantContext(tenantIdOrSlug);
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        active: true,
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }]
      },
      select: { id: true }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant storefront is not available.');
    }
    return tenant.id;
  }

  private async writeProductViewed(tenantId: string, productId: string) {
    await this.prisma.outboxEvent.create({
      data: {
        tenantId,
        aggregateId: productId,
        name: domainEvents.productViewed,
        payload: {
          productId,
          sideEffects: ['recommendations.engagement.aggregate']
        }
      }
    });
  }

  private textFromMetadata(metadata: Prisma.JsonValue, key: string) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }
    const value = metadata[key];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private booleanFromMetadata(metadata: Prisma.JsonValue, key: string) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return false;
    }
    return metadata[key] === true;
  }

  private stringArrayFromMetadata(metadata: Prisma.JsonValue, key: string) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return [];
    }
    const value = metadata[key];
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim().toLowerCase());
  }

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
