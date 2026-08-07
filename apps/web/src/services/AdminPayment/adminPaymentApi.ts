import { apiFetch } from '@/lib/api/client';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listPendingManualProofs() {
  return apiFetch<ApiEnvelope<AdminManualPaymentProofModel[]>>('/admin/payments/manual/proofs').then(
    (response) => response.data,
  );
}

export function approveManualProof(proofId: string) {
  return apiFetch<ApiEnvelope<AdminManualPaymentProofModel>>(
    `/admin/payments/manual/proofs/${proofId}/approve`,
    { method: 'POST' },
  ).then((response) => response.data);
}

export function rejectManualProof(proofId: string, reason: string) {
  return apiFetch<ApiEnvelope<AdminManualPaymentProofModel>>(
    `/admin/payments/manual/proofs/${proofId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason })
    },
  ).then((response) => response.data);
}
