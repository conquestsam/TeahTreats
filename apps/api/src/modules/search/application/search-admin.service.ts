import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { OpenSearchService } from '../../../infrastructure/search/opensearch.service.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class SearchAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly search: OpenSearchService,
  ) {}

  async reindexProducts(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        status: ProductStatus.active
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        skus: { where: { active: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const documents = products.map((product) => {
      const metadata = this.record(product.metadata);
      return {
        id: product.id,
        tenantId: product.tenantId,
        status: product.status,
        slug: product.slug,
        name: product.name,
        description: product.description,
        brand: product.brand,
        category: product.category,
        tags: this.stringArray(metadata.tags),
        dietaryLabels: this.stringArray(metadata.dietaryLabels),
        imageUrl: product.images[0]?.url ?? null,
        minPriceCents: product.skus.length ? Math.min(...product.skus.map((sku) => sku.priceCents)) : null,
        updatedAt: product.updatedAt.toISOString()
      };
    });

    return this.search.reindexProducts(documents);
  }

  private record(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  }

  private stringArray(value: unknown) {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }
}
