'use client';

import { useForm } from '@mantine/form';
import { adminLoginInitialValues } from '@/constants/AdminAuth/adminAuthConstants';
import {
  adminLoginSchema,
  type AdminLoginFormValues
} from '@/validation/AdminAuth/adminAuthValidation';

export function useAdminAuthForm() {
  return useForm<AdminLoginFormValues>({
    initialValues: adminLoginInitialValues,
    validate: (values) => {
      const result = adminLoginSchema.safeParse(values);
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
    },
    validateInputOnBlur: true
  });
}
