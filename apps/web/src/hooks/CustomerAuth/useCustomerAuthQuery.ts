'use client';

import { useQuery } from '@tanstack/react-query';
import { customerAuthQueryKey, customerCsrfQueryKey } from '@/constants/CustomerAuth/customerAuthConstants';
import { getCurrentCustomer, getCustomerCsrf } from '@/services/CustomerAuth/customerAuthApi';

export function useCustomerCsrfQuery() {
  return useQuery({
    queryKey: customerCsrfQueryKey,
    queryFn: getCustomerCsrf,
    staleTime: 20 * 60 * 1000
  });
}

export function useCurrentCustomerQuery(enabled = true) {
  return useQuery({
    queryKey: customerAuthQueryKey,
    queryFn: getCurrentCustomer,
    enabled,
    retry: false,
    staleTime: 30 * 1000
  });
}
