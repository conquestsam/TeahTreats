import { apiFetch } from '@/lib/api/client';
import type { VendorProductDetail, VendorProductRow } from '@/types/VendorProduct/vendorProductTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listVendorProducts() {
  return apiFetch<ApiEnvelope<VendorProductRow[]>>('/vendor/products').then((response) => response.data);
}

export function getVendorProduct(productId: string) {
  return apiFetch<ApiEnvelope<VendorProductDetail>>(`/vendor/products/${productId}`).then(
    (response) => response.data,
  );
}
