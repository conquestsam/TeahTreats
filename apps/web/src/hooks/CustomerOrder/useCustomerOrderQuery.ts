'use client';

import { useQuery } from '@tanstack/react-query';
import { customerOrderDetailsQueryKey, customerOrdersQueryKey } from '@/constants/CustomerOrder/customerOrderConstants';
import { getCustomerOrder, listCustomerOrders } from '@/services/CustomerOrder/customerOrderApi';

export function useCustomerOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: customerOrdersQueryKey,
    queryFn: listCustomerOrders,
    enabled,
    retry: false
  });
}

export function useCustomerOrderDetailsQuery(orderId: string | null) {
  return useQuery({
    queryKey: customerOrderDetailsQueryKey(orderId),
    queryFn: () => getCustomerOrder(orderId ?? ''),
    enabled: Boolean(orderId),
    retry: false
  });
}
