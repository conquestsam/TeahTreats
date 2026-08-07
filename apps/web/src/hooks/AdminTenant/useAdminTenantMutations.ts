'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTenantQueryKey } from '@/constants/AdminTenant/adminTenantConstants';
import {
  createAdminTenant,
  deactivateAdminTenant,
  reactivateAdminTenant,
  updateAdminTenant
} from '@/services/AdminTenant/adminTenantApi';
import type {
  AdminTenantInput,
  DeactivateTenantInput
} from '@/types/AdminTenant/adminTenantTypes';

function showSuccess(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function showError(message: string) {
  notifications.show({ color: 'red', title: 'Action failed', message });
}

export function useAdminTenantMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminTenantQueryKey });

  const createTenantMutation = useMutation({
    mutationFn: (input: AdminTenantInput) => createAdminTenant(input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Tenant created.');
      onDone();
    },
    onError: () => showError('Could not create tenant.')
  });

  const updateTenantMutation = useMutation({
    mutationFn: (payload: { tenantId: string; tenant: Partial<AdminTenantInput> }) =>
      updateAdminTenant(payload.tenantId, payload.tenant),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Tenant updated.');
      onDone();
    },
    onError: () => showError('Could not update tenant.')
  });

  const deactivateTenantMutation = useMutation({
    mutationFn: (payload: { tenantId: string; input: DeactivateTenantInput }) =>
      deactivateAdminTenant(payload.tenantId, payload.input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Tenant deactivated.');
      onDone();
    },
    onError: () => showError('Could not deactivate tenant.')
  });

  const reactivateTenantMutation = useMutation({
    mutationFn: (tenantId: string) => reactivateAdminTenant(tenantId),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Tenant reactivated.');
      onDone();
    },
    onError: () => showError('Could not reactivate tenant.')
  });

  return {
    createTenantMutation,
    updateTenantMutation,
    deactivateTenantMutation,
    reactivateTenantMutation
  };
}
