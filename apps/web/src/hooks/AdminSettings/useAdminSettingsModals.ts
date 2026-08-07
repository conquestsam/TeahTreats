'use client';

import { useState } from 'react';
import type { AdminManualPaymentMethodModel } from '@/types/AdminSettings/adminSettingsTypes';

export type AdminSettingsModalMode =
  | 'business'
  | 'approval'
  | 'notifications'
  | 'manual-create'
  | 'manual-edit'
  | 'manual-activate'
  | 'manual-deactivate'
  | null;

export function useAdminSettingsModals() {
  const [mode, setMode] = useState<AdminSettingsModalMode>(null);
  const [selectedMethod, setSelectedMethod] = useState<AdminManualPaymentMethodModel | null>(null);

  return {
    mode,
    selectedMethod,
    openBusiness: () => setMode('business'),
    openApproval: () => setMode('approval'),
    openNotifications: () => setMode('notifications'),
    openManualCreate: () => {
      setSelectedMethod(null);
      setMode('manual-create');
    },
    openManualEdit: (method: AdminManualPaymentMethodModel) => {
      setSelectedMethod(method);
      setMode('manual-edit');
    },
    openManualActivate: (method: AdminManualPaymentMethodModel) => {
      setSelectedMethod(method);
      setMode('manual-activate');
    },
    openManualDeactivate: (method: AdminManualPaymentMethodModel) => {
      setSelectedMethod(method);
      setMode('manual-deactivate');
    },
    closeModal: () => {
      setSelectedMethod(null);
      setMode(null);
    }
  };
}
