import { z } from 'zod';

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
  phone: z.string().trim().min(7, 'Phone is required.'),
  address: z.string().trim().min(5, 'Address is required.'),
  fulfillmentMethod: z.enum(['delivery_handoff', 'store_pickup', 'scheduled_delivery']).default('delivery_handoff'),
  recipientName: z.string().trim().max(120, 'Use 120 characters or less.').optional(),
  addressLine1: z.string().trim().max(180, 'Use 180 characters or less.').optional(),
  addressLine2: z.string().trim().max(120, 'Use 120 characters or less.').optional(),
  city: z.string().trim().max(80, 'Use 80 characters or less.').optional(),
  state: z.string().trim().max(40, 'Use 40 characters or less.').optional(),
  postalCode: z.string().trim().max(20, 'Use 20 characters or less.').optional(),
  handoffInstructions: z.string().trim().max(500, 'Use 500 characters or less.').optional(),
  deliveryDate: z.string().trim().max(32, 'Use 32 characters or less.').optional(),
  deliveryWindow: z.string().trim().max(80, 'Use 80 characters or less.').optional(),
  deliverySlotId: z.string().trim().max(120, 'Choose a valid delivery slot.').optional()
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
