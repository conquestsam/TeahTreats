import { z } from 'zod';

export const createInventoryBatchSchema = z.object({
  skuId: z.string().min(1, 'SKU is required.'),
  quantity: z.number().min(0, 'Quantity cannot be negative.'),
  expiresAt: z.string().optional(),
  reason: z.string().trim().min(2, 'Reason is required.')
});

export const adjustInventoryBatchSchema = z.object({
  quantityDelta: z.number().refine((value) => value !== 0, 'Adjustment cannot be zero.'),
  reason: z.string().trim().min(2, 'Reason is required.')
});

export type CreateInventoryBatchFormValues = z.infer<typeof createInventoryBatchSchema>;
export type AdjustInventoryBatchFormValues = z.infer<typeof adjustInventoryBatchSchema>;

export function validateWithSchema<TValues extends Record<string, unknown>>(
  schema: z.ZodType<TValues>,
  values: TValues,
) {
  const result = schema.safeParse(values);
  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<Record<string, string>>((errors, issue) => {
    const [field] = issue.path;
    if (typeof field === 'string') {
      errors[field] = issue.message;
    }
    return errors;
  }, {});
}
