import { z } from 'zod';

export const storefrontAvailabilityStatuses = [
  'in_stock',
  'low_stock',
  'out_of_stock',
  'unavailable'
] as const;

export const storefrontSortOptions = ['newest', 'price_asc', 'price_desc', 'name_asc', 'popular'] as const;

export const storefrontAvailabilitySchema = z.enum(storefrontAvailabilityStatuses);
export const storefrontSortSchema = z.enum(storefrontSortOptions);

export const storefrontProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  q: z.string().trim().min(1).max(80).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  brand: z.string().trim().min(1).max(80).optional(),
  tag: z.string().trim().min(1).max(80).optional(),
  sort: storefrontSortSchema.default('newest')
});
