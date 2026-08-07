'use client';

import { useQuery } from '@tanstack/react-query';
import { adminManualPaymentProofQueryKey } from '@/constants/AdminPayment/adminPaymentConstants';
import { listPendingManualProofs } from '@/services/AdminPayment/adminPaymentApi';

export function useManualPaymentProofQuery() {
  return useQuery({
    queryKey: adminManualPaymentProofQueryKey,
    queryFn: listPendingManualProofs
  });
}
