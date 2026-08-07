'use client';

import { useMutation } from '@tanstack/react-query';
import { createCustomerBundlePreview } from '@/services/CustomerBundle/customerBundleApi';

export function useCustomerBundlePreviewMutation() {
  return useMutation({ mutationFn: createCustomerBundlePreview });
}
