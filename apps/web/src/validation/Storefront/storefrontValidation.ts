import { z } from 'zod';

export const storefrontSearchSchema = z.object({
  q: z.string().trim().max(80, 'Search must be shorter.').optional()
});

export const storefrontAddToCartSchema = z.object({
  skuId: z.string().uuid('Choose a snack option.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.')
});

export function zodToMantineErrors<TValues>(schema: z.ZodType<TValues>) {
  return (values: TValues) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {};
    }
    return Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
  };
}
