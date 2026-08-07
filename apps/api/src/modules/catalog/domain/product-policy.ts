import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductForPolicy {
  id: string;
  tenantId: string;
  status: ProductStatus;
  metadata?: unknown;
  skus?: Array<{ active: boolean }>;
}

export class ProductPolicy {
  static ensureTenantContext(tenantId: string | undefined): asserts tenantId is string {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required.');
    }
  }

  static ensureFound<TValue>(value: TValue | null, message = 'Product was not found.'): TValue {
    if (!value) {
      throw new NotFoundException(message);
    }

    return value;
  }

  static ensureEditable(product: ProductForPolicy) {
    if (product.status === 'archived') {
      throw new ConflictException('Archived products cannot be edited. Restore the product first.');
    }
  }

  static ensureCanActivate(product: ProductForPolicy) {
    const hasActiveSku = product.skus?.some((sku) => sku.active) ?? false;
    if (!hasActiveSku) {
      throw new BadRequestException('Add at least one active SKU before activating this product.');
    }

    const metadata = this.readMetadata(product.metadata);
    if (metadata.isPerishable && !metadata.storageInstructions && !metadata.shelfLifeNotes) {
      throw new BadRequestException('Add storage instructions or shelf-life notes before activating a perishable product.');
    }
  }

  static ensureSkuTenant(product: ProductForPolicy, tenantId: string) {
    if (product.tenantId !== tenantId) {
      throw new NotFoundException('Product was not found for this tenant.');
    }
  }

  private static readMetadata(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const metadata = value as Record<string, unknown>;
    return {
      isPerishable: metadata.isPerishable === true,
      storageInstructions:
        typeof metadata.storageInstructions === 'string' ? metadata.storageInstructions.trim() : '',
      shelfLifeNotes: typeof metadata.shelfLifeNotes === 'string' ? metadata.shelfLifeNotes.trim() : ''
    };
  }
}
