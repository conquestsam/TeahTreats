'use client';

import { useForm } from '@mantine/form';
import { customerPaymentInitialValues } from '@/constants/CustomerPayment/customerPaymentConstants';
import {
  manualProofSchema,
  validateWithSchema,
  type ManualProofFormValues
} from '@/validation/CustomerPayment/customerPaymentValidation';

export function useCustomerPaymentForm(initialOrderId?: string) {
  return useForm<ManualProofFormValues>({
    initialValues: {
      ...customerPaymentInitialValues,
      orderId: initialOrderId ?? ''
    },
    validate: (values) => validateWithSchema(manualProofSchema, values),
    validateInputOnBlur: true
  });
}
