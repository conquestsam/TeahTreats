import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/\d/, 'Add a number.');

export const customerLoginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.')
});

export const customerSignupSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
  phone: z.string().trim().min(7, 'Phone is required.'),
  password: passwordSchema
});

export type CustomerLoginFormValues = z.infer<typeof customerLoginSchema>;
export type CustomerSignupFormValues = z.infer<typeof customerSignupSchema>;

export function zodToMantineErrors(values: unknown, schema: z.ZodType) {
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
