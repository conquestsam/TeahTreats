'use client';

import { useQuery } from '@tanstack/react-query';
import { customerLoyaltyQueryKey } from '@/constants/CustomerLoyalty/customerLoyaltyConstants';
import { getCustomerLoyalty } from '@/services/CustomerLoyalty/customerLoyaltyApi';

export function useCustomerLoyaltyQuery() {
  return useQuery({ queryKey: customerLoyaltyQueryKey, queryFn: getCustomerLoyalty });
}
