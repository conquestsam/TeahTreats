'use client';

import { useForm } from '@mantine/form';
import { checkoutCustomerInitialValues } from '@/constants/CustomerCart/customerCartConstants';
import {
  checkoutCustomerSchema,
  validateWithSchema,
  type CheckoutCustomerFormValues
} from '@/validation/CustomerCart/customerCartValidation';

export function useCustomerCheckoutForm() {
  return useForm<CheckoutCustomerFormValues>({
    initialValues: checkoutCustomerInitialValues,
    validate: (values) => validateWithSchema(checkoutCustomerSchema, values),
    validateInputOnBlur: true
  });
}
