import { z } from 'zod';

export const adminUserSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
  name: z.string().trim().min(2, 'Name is required.'),
  phone: z.string().trim().optional(),
  temporaryPassword: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, 'Password must be at least 8 characters.')
});

export const adminUserEditSchema = adminUserSchema.pick({ name: true, phone: true });

export const adminRoleAssignmentSchema = z.object({
  roleId: z.string().min(1, 'Role is required.'),
  tenantId: z.string().min(1, 'Tenant is required.'),
  reason: z.string().trim().optional()
});

export const adminRoleSchema = z.object({
  name: z.string().trim().min(2, 'Role name is required.'),
  permissions: z.array(z.string()).min(1, 'Choose at least one permission.')
});

export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
export type AdminUserEditFormValues = z.infer<typeof adminUserEditSchema>;
export type AdminRoleAssignmentFormValues = z.infer<typeof adminRoleAssignmentSchema>;
export type AdminRoleFormValues = z.infer<typeof adminRoleSchema>;

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
