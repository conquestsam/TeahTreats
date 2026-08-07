'use client';

import { useState } from 'react';
import type { AdminPromotionModel } from '@/types/AdminPromotion/adminPromotionTypes';

export type AdminPromotionModalMode = 'create' | 'edit' | 'archive' | null;

export function useAdminPromotionModals() {
  const [mode, setMode] = useState<AdminPromotionModalMode>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<AdminPromotionModel | null>(null);

  return {
    mode,
    selectedPromotion,
    openCreate: () => {
      setSelectedPromotion(null);
      setMode('create');
    },
    openEdit: (promotion: AdminPromotionModel) => {
      setSelectedPromotion(promotion);
      setMode('edit');
    },
    openArchive: (promotion: AdminPromotionModel) => {
      setSelectedPromotion(promotion);
      setMode('archive');
    },
    closeModal: () => {
      setSelectedPromotion(null);
      setMode(null);
    }
  };
}
