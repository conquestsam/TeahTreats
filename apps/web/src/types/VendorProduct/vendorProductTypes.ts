import type { ProductStatus } from '@snacks/shared';

export interface VendorProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  skuCount: number;
  activeSkuCount: number;
  updatedAt: string;
}

export interface VendorProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  status: ProductStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
  skus: Array<{
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    active: boolean;
    metadata: Record<string, unknown>;
  }>;
}
