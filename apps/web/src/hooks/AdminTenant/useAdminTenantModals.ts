'use client';

import { useState } from 'react';
import type { AdminTenantModel } from '@/types/AdminTenant/adminTenantTypes';

export type AdminTenantModalMode = 'create' | 'edit' | 'deactivate' | 'reactivate' | null;

export function useAdminTenantModals() {
  const [mode, setMode] = useState<AdminTenantModalMode>(null);
  const [selectedTenant, setSelectedTenant] = useState<AdminTenantModel | null>(null);

  return {
    mode,
    selectedTenant,
    openCreate: () => {
      setSelectedTenant(null);
      setMode('create');
    },
    openEdit: (tenant: AdminTenantModel) => {
      setSelectedTenant(tenant);
      setMode('edit');
    },
    openDeactivate: (tenant: AdminTenantModel) => {
      setSelectedTenant(tenant);
      setMode('deactivate');
    },
    openReactivate: (tenant: AdminTenantModel) => {
      setSelectedTenant(tenant);
      setMode('reactivate');
    },
    closeModal: () => {
      setSelectedTenant(null);
      setMode(null);
    }
  };
}
