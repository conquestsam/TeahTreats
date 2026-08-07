'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorOrder, listVendorOrders } from '@/services/VendorOrder/vendorOrderApi';

export const vendorOrderQueryKey = ['vendor-orders'] as const;

export function useVendorOrderQuery() {
  return useQuery({ queryKey: vendorOrderQueryKey, queryFn: listVendorOrders });
}

export function useVendorOrderDetailQuery(orderId: string | null) {
  return useQuery({
    queryKey: ['vendor-order-detail', orderId],
    queryFn: () => getVendorOrder(orderId as string),
    enabled: Boolean(orderId)
  });
}
