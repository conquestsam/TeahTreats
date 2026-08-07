'use client';

import { useState } from 'react';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';

type AdminPaymentModalMode = 'closed' | 'view' | 'approve' | 'reject';

export function useAdminPaymentModals() {
  const [mode, setMode] = useState<AdminPaymentModalMode>('closed');
  const [selectedProof, setSelectedProof] = useState<AdminManualPaymentProofModel | null>(null);

  const open = (nextMode: AdminPaymentModalMode, proof: AdminManualPaymentProofModel) => {
    setSelectedProof(proof);
    setMode(nextMode);
  };

  return {
    mode,
    selectedProof,
    openView: (proof: AdminManualPaymentProofModel) => open('view', proof),
    openApprove: (proof: AdminManualPaymentProofModel) => open('approve', proof),
    openReject: (proof: AdminManualPaymentProofModel) => open('reject', proof),
    closeModal: () => {
      setMode('closed');
      setSelectedProof(null);
    }
  };
}
