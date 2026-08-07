'use client';

import { useState } from 'react';
import type {
  AdminInventoryBatchModel,
  AdminInventoryModalMode
} from '@/types/AdminInventory/adminInventoryTypes';

export function useAdminInventoryModals() {
  const [mode, setMode] = useState<AdminInventoryModalMode>('closed');
  const [selectedBatch, setSelectedBatch] = useState<AdminInventoryBatchModel | null>(null);

  const closeModal = () => {
    setMode('closed');
    setSelectedBatch(null);
  };

  return {
    mode,
    selectedBatch,
    openCreate: () => setMode('create'),
    openAdjust: (batch: AdminInventoryBatchModel) => {
      setSelectedBatch(batch);
      setMode('adjust');
    },
    openDetails: (batch: AdminInventoryBatchModel) => {
      setSelectedBatch(batch);
      setMode('details');
    },
    openExpire: (batch: AdminInventoryBatchModel) => {
      setSelectedBatch(batch);
      setMode('expire');
    },
    closeModal
  };
}
