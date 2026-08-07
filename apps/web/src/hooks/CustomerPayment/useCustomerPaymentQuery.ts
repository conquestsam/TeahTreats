'use client';

import { useQuery } from '@tanstack/react-query';
import {
  customerPaymentMethodQueryKey,
  customerPaymentStatusQueryKey
} from '@/constants/CustomerPayment/customerPaymentConstants';
import { getCustomerPaymentStatus, getPaymentGatewayStatus, listManualPaymentMethods } from '@/services/CustomerPayment/customerPaymentApi';
import type { CustomerPaymentVerificationInput } from '@/types/CustomerPayment/customerPaymentTypes';

export function useManualPaymentMethodQuery() {
  return useQuery({ queryKey: customerPaymentMethodQueryKey, queryFn: listManualPaymentMethods });
}

export function usePaymentGatewaysQuery() {
  return useQuery({
    queryKey: ['customer-payment-gateways'],
    queryFn: getPaymentGatewayStatus,
    staleTime: 60 * 1000 // Cache for 1 minute
  });
}

export function useCustomerPaymentStatusQuery(input: CustomerPaymentVerificationInput, enabled: boolean) {
  return useQuery({
    queryKey: [...customerPaymentStatusQueryKey, input.orderId, input.email, input.phone],
    queryFn: () => getCustomerPaymentStatus(input),
    enabled
  });
}
