'use client';

import { useForm } from '@mantine/form';
import { validateCancelReason } from '@/validation/AdminOrder/adminOrderValidation';

export function useAdminOrderCancelForm() {
  return useForm({
    initialValues: {
      reason: ''
    },
    validate: {
      reason: validateCancelReason
    }
  });
}
