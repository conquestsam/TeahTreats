'use client';

import { useForm } from '@mantine/form';
import { rejectManualPaymentInitialValues } from '@/constants/AdminPayment/adminPaymentConstants';
import {
  rejectManualPaymentSchema,
  validateWithSchema,
  type RejectManualPaymentFormValues
} from '@/validation/AdminPayment/adminPaymentValidation';

export function useRejectManualPaymentForm() {
  return useForm<RejectManualPaymentFormValues>({
    initialValues: rejectManualPaymentInitialValues,
    validate: (values) => validateWithSchema(rejectManualPaymentSchema, values),
    validateInputOnBlur: true
  });
}
