import { z } from 'zod';

export const rejectManualPaymentSchema = z.object({
  reason: z.string().trim().min(2, 'Reason is required.')
});

export type RejectManualPaymentFormValues = z.infer<typeof rejectManualPaymentSchema>;

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
