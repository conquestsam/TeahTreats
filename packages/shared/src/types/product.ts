import type { ProductMetadata, ProductStatus, SkuMetadata } from '../schemas/catalog.js';

export type ProductImageStorageProvider = 'cloudinary' | 'r2';
export type ProductImageContentType = 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp';

export interface AdminProductSkuSummary {
  id: string;
  tenantId: string;
  productId: string;
  name: string;
  priceCents: number;
  currency: string;
  active: boolean;
  metadata: SkuMetadata & Record<string, unknown>;
  available: number;
  reserved: number;
  lowStockThreshold: number | null;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockStatusLabel: string;
}

export interface AdminProductImageSummary {
  id: string;
  productId: string;
  url: string;
  objectKey: string | null;
  storageProvider: string;
  contentType: string | null;
  alt: string | null;
  sortOrder: number;
}

export interface AdminProductSummary {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  status: ProductStatus;
  metadata: ProductMetadata & Record<string, unknown>;
  skus: AdminProductSkuSummary[];
  images: AdminProductImageSummary[];
  primaryImageUrl: string | null;
  skuCount: number;
  activeSkuCount: number;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  currency: string;
  priceRangeLabel: string;
  totalAvailable: number;
  totalReserved: number;
  lowStockSkuCount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_tracked';
  stockStatusLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminProductInput {
  name: string;
  slug?: string;
  description?: string;
  status?: ProductStatus;
  metadata?: Record<string, unknown>;
  brand?: string;
  category?: string;
  tags?: string[];
  flavor?: string;
  occasion?: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionFacts?: Record<string, string>;
  dietaryLabels?: string[];
  isPerishable?: boolean;
  storageInstructions?: string;
  shelfLifeNotes?: string;
  bundleEligible?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateAdminProductInput {
  name?: string;
  description?: string;
  status?: ProductStatus;
  metadata?: Record<string, unknown>;
  brand?: string | null;
  category?: string | null;
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
}

export interface CreateAdminProductSkuInput {
  name: string;
  priceCents: number;
  currency?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
  size?: string;
  packCount?: number;
  unitLabel?: string;
  barcode?: string;
  weight?: string;
  dimensions?: string;
  perishableOverride?: boolean;
}

export interface UpdateAdminProductSkuInput {
  name?: string;
  priceCents?: number;
  currency?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
  size?: string | null;
  packCount?: number | null;
  unitLabel?: string | null;
  barcode?: string | null;
  weight?: string | null;
  dimensions?: string | null;
  perishableOverride?: boolean | null;
}

export interface CreateAdminProductImageUploadInput {
  contentType: ProductImageContentType;
  sizeBytes?: number;
}

export interface CreateAdminProductImageInput {
  url: string;
  objectKey?: string;
  storageProvider?: ProductImageStorageProvider;
  contentType?: ProductImageContentType;
  alt?: string;
  sortOrder?: number;
}

export interface UpdateAdminProductImageInput {
  alt?: string | null;
  sortOrder?: number;
}

export interface AdminProductImageUploadSummary {
  provider: ProductImageStorageProvider;
  uploadUrl: string;
  fields: Record<string, string | number>;
  objectKey: string;
  publicUrl?: string;
  expiresInSeconds: number;
}
