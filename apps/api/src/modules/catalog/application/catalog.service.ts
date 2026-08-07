import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents } from '@snacks/shared';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CloudinaryStorageService } from '../../../infrastructure/storage/cloudinary.service.js';
import { R2StorageService } from '../../../infrastructure/storage/r2.service.js';
import { ProductPolicy } from '../domain/product-policy.js';
import type {
  CreateProductImageDto,
  CreateProductImageUploadDto,
  UpdateProductImageDto
} from '../presentation/dto/image-upload.dto.js';
import type { CreateProductDto, UpdateProductDto } from '../presentation/dto/product.dto.js';
import type { CreateSkuDto, UpdateSkuDto } from '../presentation/dto/sku.dto.js';

const productInclude = {
  skus: {
    orderBy: { name: 'asc' as const }
  },
  images: {
    orderBy: { sortOrder: 'asc' as const }
  }
};

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryStorageService,
    private readonly r2: R2StorageService,
  ) {}

  listFeaturedProducts() {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.active
      },
      include: productInclude,
      orderBy: { updatedAt: 'desc' },
      take: 12
    });
  }

  async listProducts(tenantId: string) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);

    return this.prisma.product.findMany({
      where: { tenantId: resolvedTenantId },
      include: productInclude,
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getProduct(tenantId: string, productId: string) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);

    return ProductPolicy.ensureFound(
      await this.prisma.product.findFirst({
        where: {
          id: productId,
          tenantId: resolvedTenantId
        },
        include: productInclude
      }),
    );
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const slug = dto.slug ?? this.slugify(dto.name);
    await this.ensureSlugIsAvailable(resolvedTenantId, slug);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId: resolvedTenantId,
          name: dto.name.trim(),
          slug,
          ...(dto.description ? { description: dto.description.trim() } : {}),
          ...this.extractMerchandisingFields(dto),
          status: dto.status ?? 'draft',
          metadata: this.toJson(this.mergeProductMetadata(undefined, dto))
        },
        include: productInclude
      });

      if (product.status === ProductStatus.active) {
        ProductPolicy.ensureCanActivate(product);
      }

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productCreated,
          tenantId: resolvedTenantId,
          aggregateId: product.id,
          payload: this.toJson({ productId: product.id, slug: product.slug })
        }
      });

      return product;
    });
  }

  async updateProduct(tenantId: string, productId: string, dto: UpdateProductDto) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const existing = await this.getProduct(resolvedTenantId, productId);

    if (dto.status !== 'draft' && dto.status !== undefined) {
      ProductPolicy.ensureEditable(existing);
    } else if (existing.status === ProductStatus.archived) {
      ProductPolicy.ensureEditable(existing);
    }

    if (dto.status === 'active') {
      ProductPolicy.ensureCanActivate({
        ...existing,
        metadata: this.mergeProductMetadata(existing.metadata, dto)
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          ...(dto.name ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
          ...this.extractMerchandisingFields(dto),
          ...(dto.status ? { status: dto.status } : {}),
          metadata: this.toJson(this.mergeProductMetadata(existing.metadata, dto))
        },
        include: productInclude
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productUpdated,
          tenantId: resolvedTenantId,
          aggregateId: product.id,
          payload: this.toJson({ productId: product.id, status: product.status })
        }
      });

      return product;
    });
  }

  async archiveProduct(tenantId: string, productId: string) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.getProduct(resolvedTenantId, productId);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: { status: ProductStatus.archived },
        include: productInclude
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productArchived,
          tenantId: resolvedTenantId,
          aggregateId: product.id,
          payload: this.toJson({ productId: product.id })
        }
      });

      return product;
    });
  }

  async restoreProduct(tenantId: string, productId: string) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.getProduct(resolvedTenantId, productId);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: { status: ProductStatus.draft },
        include: productInclude
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productRestored,
          tenantId: resolvedTenantId,
          aggregateId: product.id,
          payload: this.toJson({ productId: product.id })
        }
      });

      return product;
    });
  }

  async createSku(tenantId: string, productId: string, dto: CreateSkuDto) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const product = await this.getProduct(resolvedTenantId, productId);
    ProductPolicy.ensureEditable(product);
    ProductPolicy.ensureSkuTenant(product, resolvedTenantId);

    return this.prisma.$transaction(async (tx) => {
      const sku = await tx.sku.create({
        data: {
          tenantId: resolvedTenantId,
          productId,
          name: dto.name.trim(),
          priceCents: dto.priceCents,
          currency: dto.currency ?? 'USD',
          active: dto.active ?? true,
          metadata: this.toJson(this.mergeSkuMetadata(undefined, dto))
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.skuCreated,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, skuId: sku.id })
        }
      });

      return sku;
    });
  }

  async updateSku(tenantId: string, productId: string, skuId: string, dto: UpdateSkuDto) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const product = await this.getProduct(resolvedTenantId, productId);
    ProductPolicy.ensureEditable(product);

    const existingSku = ProductPolicy.ensureFound(
      await this.prisma.sku.findFirst({
        where: {
          id: skuId,
          productId,
          tenantId: resolvedTenantId
        }
      }),
      'SKU was not found for this product.',
    );

    return this.prisma.$transaction(async (tx) => {
      const sku = await tx.sku.update({
        where: { id: existingSku.id },
        data: {
          ...(dto.name ? { name: dto.name.trim() } : {}),
          ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
          ...(dto.currency ? { currency: dto.currency } : {}),
          ...(dto.active !== undefined ? { active: dto.active } : {}),
          metadata: this.toJson(this.mergeSkuMetadata(existingSku.metadata, dto))
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.skuUpdated,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, skuId: sku.id })
        }
      });

      return sku;
    });
  }

  async createProductImageUpload(
    tenantId: string,
    productId: string,
    dto: CreateProductImageUploadDto,
  ) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.getProduct(resolvedTenantId, productId);
    if (dto.sizeBytes && dto.sizeBytes > 5 * 1024 * 1024) {
      throw new BadRequestException('Product image must be 5 MB or smaller.');
    }

    if (this.cloudinary.isConfigured()) {
      return this.cloudinary.createSignedUpload({
        tenantId: resolvedTenantId,
        productId,
        contentType: dto.contentType
      });
    }

    const objectKey = this.r2.createSafeObjectKey({
      tenantId: resolvedTenantId,
      productId,
      contentType: dto.contentType
    });
    const uploadUrl = await this.r2.createSignedUploadUrl(objectKey, dto.contentType);

    return {
      provider: 'r2' as const,
      uploadUrl,
      fields: {},
      objectKey,
      publicUrl: this.r2.createPublicUrl(objectKey),
      expiresInSeconds: 300
    };
  }

  async createProductImage(tenantId: string, productId: string, dto: CreateProductImageDto) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.getProduct(resolvedTenantId, productId);

    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.create({
        data: {
          productId,
          url: dto.url,
          ...(dto.objectKey ? { objectKey: dto.objectKey } : {}),
          storageProvider: dto.storageProvider ?? 'cloudinary',
          ...(dto.contentType ? { contentType: dto.contentType } : {}),
          ...(dto.alt ? { alt: dto.alt.trim() } : {}),
          sortOrder: dto.sortOrder ?? 0
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productImageCreated,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, imageId: image.id })
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productChanged,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, reason: 'image-created' })
        }
      });

      return image;
    });
  }

  async updateProductImage(
    tenantId: string,
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.getProduct(resolvedTenantId, productId);
    await this.ensureProductImage(resolvedTenantId, productId, imageId);

    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.update({
        where: { id: imageId },
        data: {
          ...(dto.alt !== undefined ? { alt: dto.alt?.trim() || null } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {})
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productImageUpdated,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, imageId: image.id })
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productChanged,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, reason: 'image-updated' })
        }
      });

      return image;
    });
  }

  async removeProductImage(tenantId: string, productId: string, imageId: string) {
    ProductPolicy.ensureTenantContext(tenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.getProduct(resolvedTenantId, productId);
    await this.ensureProductImage(resolvedTenantId, productId, imageId);

    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.delete({ where: { id: imageId } });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productImageRemoved,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, imageId })
        }
      });

      await tx.outboxEvent.create({
        data: {
          name: domainEvents.productChanged,
          tenantId: resolvedTenantId,
          aggregateId: productId,
          payload: this.toJson({ productId, reason: 'image-removed' })
        }
      });

      return image;
    });
  }

  private async ensureSlugIsAvailable(tenantId: string, slug: string) {
    const existing = await this.prisma.product.findUnique({
      where: {
        tenantId_slug: {
          tenantId,
          slug
        }
      }
    });

    if (existing) {
      throw new ConflictException('A product with this slug already exists.');
    }
  }

  private async ensureProductImage(tenantId: string, productId: string, imageId: string) {
    return ProductPolicy.ensureFound(
      await this.prisma.productImage.findFirst({
        where: {
          id: imageId,
          productId,
          product: {
            tenantId
          }
        }
      }),
      'Product image was not found for this product.',
    );
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantIdOrSlug)) {
      return tenantIdOrSlug;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug: tenantIdOrSlug
      },
      select: {
        id: true
      }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }

    return tenant.id;
  }

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 140);
  }

  private toJson(value: Record<string, unknown> | undefined): Prisma.InputJsonObject {
    return (value ?? {}) as Prisma.InputJsonObject;
  }

  private extractMerchandisingFields(input?: {
    brand?: string | null;
    category?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    const brand = this.optionalText(input?.brand ?? input?.metadata?.brand);
    const category = this.optionalText(input?.category ?? input?.metadata?.category);
    return {
      ...(input && 'brand' in input ? { brand: brand ?? null } : brand ? { brand } : {}),
      ...(input && 'category' in input ? { category: category ?? null } : category ? { category } : {})
    };
  }

  private mergeProductMetadata(
    current: unknown,
    input: {
      metadata?: Record<string, unknown>;
      tags?: string[];
      flavor?: string | null;
      occasion?: string | null;
      ingredients?: string[];
      allergens?: string[];
      nutritionFacts?: Record<string, string>;
      dietaryLabels?: string[];
      isPerishable?: boolean;
      storageInstructions?: string | null;
      shelfLifeNotes?: string | null;
      bundleEligible?: boolean;
      seoTitle?: string | null;
      seoDescription?: string | null;
    },
  ) {
    const base = this.objectRecord(current);
    const next = { ...base, ...(input.metadata ?? {}) };
    this.assignArray(next, 'tags', input.tags);
    this.assignText(next, 'flavor', input.flavor);
    this.assignText(next, 'occasion', input.occasion);
    this.assignArray(next, 'ingredients', input.ingredients);
    this.assignArray(next, 'allergens', input.allergens);
    if (input.nutritionFacts !== undefined) {
      next.nutritionFacts = input.nutritionFacts;
    }
    this.assignArray(next, 'dietaryLabels', input.dietaryLabels);
    if (input.isPerishable !== undefined) {
      next.isPerishable = input.isPerishable;
    }
    this.assignText(next, 'storageInstructions', input.storageInstructions);
    this.assignText(next, 'shelfLifeNotes', input.shelfLifeNotes);
    if (input.bundleEligible !== undefined) {
      next.bundleEligible = input.bundleEligible;
    }
    this.assignText(next, 'seoTitle', input.seoTitle);
    this.assignText(next, 'seoDescription', input.seoDescription);
    return next;
  }

  private mergeSkuMetadata(
    current: unknown,
    input: {
      metadata?: Record<string, unknown>;
      size?: string | null;
      packCount?: number | null;
      unitLabel?: string | null;
      barcode?: string | null;
      weight?: string | null;
      dimensions?: string | null;
      perishableOverride?: boolean | null;
    },
  ) {
    const next = { ...this.objectRecord(current), ...(input.metadata ?? {}) };
    this.assignText(next, 'size', input.size);
    if (input.packCount !== undefined) {
      next.packCount = input.packCount;
    }
    this.assignText(next, 'unitLabel', input.unitLabel);
    this.assignText(next, 'barcode', input.barcode);
    this.assignText(next, 'weight', input.weight);
    this.assignText(next, 'dimensions', input.dimensions);
    if (input.perishableOverride !== undefined) {
      next.perishableOverride = input.perishableOverride;
    }
    return next;
  }

  private objectRecord(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private assignText(target: Record<string, unknown>, key: string, value: string | null | undefined) {
    if (value === undefined) {
      return;
    }
    const text = value?.trim();
    if (text) {
      target[key] = text;
      return;
    }
    delete target[key];
  }

  private assignArray(target: Record<string, unknown>, key: string, value: string[] | undefined) {
    if (value === undefined) {
      return;
    }
    target[key] = value.map((item) => item.trim()).filter(Boolean);
  }

  private optionalText(value: unknown) {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
