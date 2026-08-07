'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorProduct, listVendorProducts } from '@/services/VendorProduct/vendorProductApi';

export const vendorProductQueryKey = ['vendor-products'] as const;

export function useVendorProductQuery() {
  return useQuery({ queryKey: vendorProductQueryKey, queryFn: listVendorProducts });
}

export function useVendorProductDetailQuery(productId: string | null) {
  return useQuery({
    queryKey: ['vendor-product-detail', productId],
    queryFn: () => getVendorProduct(productId as string),
    enabled: Boolean(productId)
  });
}
