'use client';

import { useQuery } from '@tanstack/react-query';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import { getCustomerCart } from '@/services/CustomerCart/customerCartApi';

export function useCustomerCartQuery() {
  return useQuery({ queryKey: customerCartQueryKey, queryFn: getCustomerCart });
}
