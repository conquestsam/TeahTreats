import { z } from 'zod';

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
  phone: z.string().trim().min(7, 'Phone is required.'),
  address: z.string().trim().min(5, 'Address is required.')
});

export type CheckoutCustomerFormValues = z.infer<typeof checkoutCustomerSchema>;

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
