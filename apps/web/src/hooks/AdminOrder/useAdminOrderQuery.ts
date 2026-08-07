'use client';

import { useQuery } from '@tanstack/react-query';
import { adminOrderDetailsQueryKey, adminOrdersQueryKey } from '@/constants/AdminOrder/adminOrderConstants';
import { getAdminOrder, listAdminOrders } from '@/services/AdminOrder/adminOrderApi';

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: adminOrdersQueryKey,
    queryFn: listAdminOrders
  });
}

export function useAdminOrderDetailsQuery(orderId: string | null) {
  return useQuery({
    queryKey: adminOrderDetailsQueryKey(orderId),
    queryFn: () => getAdminOrder(orderId ?? ''),
    enabled: Boolean(orderId)
  });
}
