import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type { CustomerBundlePreviewInput, CustomerBundlePreviewModel } from '@/types/CustomerBundle/customerBundleTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function createCustomerBundlePreview(input: CustomerBundlePreviewInput) {
  return apiFetch<ApiEnvelope<CustomerBundlePreviewModel>>('/shop/bundles/preview', {
    method: 'POST',
    headers: { 'x-tenant-id': customerTenantId },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
