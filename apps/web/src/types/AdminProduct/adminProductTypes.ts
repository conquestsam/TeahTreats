import type { ProductMetadata, ProductStatus, SkuMetadata } from '@snacks/shared';

export type AdminProductModalMode =
  | 'create'
  | 'edit'
  | 'details'
  | 'archive'
  | 'restore'
  | 'image-create'
  | 'image-edit'
  | 'image-remove'
  | null;

export interface AdminProductModel {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  status: ProductStatus;
  metadata: ProductMetadata & Record<string, unknown>;
  skus: AdminProductSkuModel[];
  images: AdminProductImageModel[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductSkuModel {
  id: string;
  tenantId: string;
  productId: string;
  name: string;
  priceCents: number;
  currency: string;
  active: boolean;
  metadata: SkuMetadata & Record<string, unknown>;
}

export interface AdminProductImageModel {
  id: string;
  productId: string;
  url: string;
  objectKey: string | null;
  storageProvider: string;
  contentType: string | null;
  alt: string | null;
  sortOrder: number;
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

export interface CreateAdminProductImageInput {
  url: string;
  objectKey?: string;
  storageProvider?: 'cloudinary' | 'r2';
  contentType?: 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp';
  alt?: string;
  sortOrder?: number;
}

export interface UpdateAdminProductImageInput {
  alt?: string | null;
  sortOrder?: number;
}

export interface AdminProductImageUploadSummary {
  provider: 'cloudinary' | 'r2';
  uploadUrl: string;
  fields: Record<string, string | number>;
  objectKey: string;
  publicUrl?: string;
  expiresInSeconds: number;
}

export interface AdminProductActionHandlers {
  onDetails: (product: AdminProductModel) => void;
  onEdit: (product: AdminProductModel) => void;
  onArchive: (product: AdminProductModel) => void;
  onRestore: (product: AdminProductModel) => void;
}
