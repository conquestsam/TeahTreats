'use client';

import { useForm } from '@mantine/form';
import { storefrontAddToCartInitialValues } from '@/constants/Storefront/storefrontConstants';
import { storefrontAddToCartSchema, zodToMantineErrors } from '@/validation/Storefront/storefrontValidation';

export function useStorefrontAddToCartForm() {
  return useForm({
    mode: 'uncontrolled',
    initialValues: storefrontAddToCartInitialValues,
    validate: zodToMantineErrors(storefrontAddToCartSchema)
  });
}
