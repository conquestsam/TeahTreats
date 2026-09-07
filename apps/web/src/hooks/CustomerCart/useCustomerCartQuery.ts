'use client';

import { useQuery } from '@tanstack/react-query';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import { getCustomerCart, listCustomerDeliverySlots } from '@/services/CustomerCart/customerCartApi';
import type { CustomerFulfillmentMethod } from '@/types/CustomerCart/customerCartTypes';

export function useCustomerCartQuery() {
  return useQuery({ queryKey: customerCartQueryKey, queryFn: getCustomerCart });
}

export function useCustomerDeliverySlotsQuery(method: CustomerFulfillmentMethod) {
  return useQuery({
    queryKey: ['customer-delivery-slots', method],
    queryFn: () => listCustomerDeliverySlots(method),
    staleTime: 60 * 1000
  });
}
