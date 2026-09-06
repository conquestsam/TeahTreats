'use client';

import { useQuery } from '@tanstack/react-query';
import { customerOrderDetailsQueryKey, customerOrdersQueryKey } from '@/constants/CustomerOrder/customerOrderConstants';
import { getCustomerOrder, listCustomerOrders, lookupCustomerOrder } from '@/services/CustomerOrder/customerOrderApi';

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

export function useVerifiedCustomerOrderDetailsQuery(input: { orderId: string; email: string; phone: string } | null) {
  return useQuery({
    queryKey: input ? [...customerOrderDetailsQueryKey(input.orderId), 'verified', input.email, input.phone] : ['customer-order-detail', 'verified', null],
    queryFn: () => lookupCustomerOrder(input ?? { orderId: '', email: '', phone: '' }),
    enabled: Boolean(input?.orderId && input.email && input.phone),
    retry: false
  });
}
