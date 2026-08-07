import { z } from 'zod';

export const productStatuses = ['draft', 'active', 'archived'] as const;
export const productStatusSchema = z.enum(productStatuses);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productMetadataSchema = z
  .object({
    isPerishable: z.boolean().optional(),
    flavor: z.string().trim().max(80).optional(),
    occasion: z.string().trim().max(80).optional(),
    ingredients: z.array(z.string().min(1).max(80)).default([]),
    allergens: z.array(z.string().min(1)).default([]),
    nutritionFacts: z.record(z.string(), z.string()).default({}),
    dietaryLabels: z.array(z.string().min(1)).default([]),
    tags: z.array(z.string().min(1)).default([]),
    storageInstructions: z.string().trim().max(500).optional(),
    shelfLifeNotes: z.string().trim().max(500).optional(),
    bundleEligible: z.boolean().optional(),
    seoTitle: z.string().trim().max(70).optional(),
    seoDescription: z.string().trim().max(180).optional()
  })
  .partial()
  .passthrough();

export const skuMetadataSchema = z
  .object({
    size: z.string().trim().max(80).optional(),
    packCount: z.number().int().positive().optional(),
    unitLabel: z.string().trim().max(40).optional(),
    barcode: z.string().trim().max(64).optional(),
    weight: z.string().trim().max(80).optional(),
    dimensions: z.string().trim().max(120).optional(),
    perishableOverride: z.boolean().optional()
  })
  .partial()
  .passthrough();

export const productSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1000).nullable(),
  status: productStatusSchema,
  metadata: productMetadataSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const skuSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  priceCents: z.number().int().positive(),
  currency: z.string().length(3).default('USD'),
  active: z.boolean(),
  metadata: skuMetadataSchema.default({})
});

export const productImageContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
export const productImageContentTypeSchema = z.enum(productImageContentTypes);

export type ProductMetadata = z.infer<typeof productMetadataSchema>;
export type SkuMetadata = z.infer<typeof skuMetadataSchema>;

export type ProductDto = z.infer<typeof productSchema>;
export type SkuDto = z.infer<typeof skuSchema>;
