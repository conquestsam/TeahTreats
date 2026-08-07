'use client';

import { useForm } from '@mantine/form';
import {
  customerLoginInitialValues,
  customerSignupInitialValues
} from '@/constants/CustomerAuth/customerAuthConstants';
import {
  customerLoginSchema,
  customerSignupSchema,
  type CustomerLoginFormValues,
  type CustomerSignupFormValues,
  zodToMantineErrors
} from '@/validation/CustomerAuth/customerAuthValidation';

export function useCustomerLoginForm() {
  return useForm<CustomerLoginFormValues>({
    initialValues: customerLoginInitialValues,
    validate: (values) => zodToMantineErrors(values, customerLoginSchema),
    validateInputOnBlur: true
  });
}

export function useCustomerSignupForm() {
  return useForm<CustomerSignupFormValues>({
    initialValues: customerSignupInitialValues,
    validate: (values) => zodToMantineErrors(values, customerSignupSchema),
    validateInputOnBlur: true
  });
}
