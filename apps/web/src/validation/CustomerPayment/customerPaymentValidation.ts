import { z } from 'zod';

export const manualProofSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email.'),
  phone: z.string().min(7, 'Phone is required.'),
  manualPaymentMethodId: z.string().min(1, 'Payment method is required.'),
  receiptUrl: z.string().min(1, 'Receipt URL is required.'),
  contentType: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']),
  objectKey: z.string().optional(),
  storageProvider: z.string().optional(),
  note: z.string().max(500, 'Use 500 characters or less.').optional()
});

export type ManualProofFormValues = z.infer<typeof manualProofSchema>;

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
