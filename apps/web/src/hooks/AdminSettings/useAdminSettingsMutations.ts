'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsQueryKey } from '@/constants/AdminSettings/adminSettingsConstants';
import {
  activateAdminManualPaymentMethod,
  createAdminManualPaymentMethod,
  deactivateAdminManualPaymentMethod,
  updateAdminApprovalSettings,
  updateAdminBusinessProfile,
  updateAdminManualPaymentMethod,
  updateAdminNotificationSettings
} from '@/services/AdminSettings/adminSettingsApi';
import type {
  AdminApprovalSettingsInput,
  AdminBusinessProfileInput,
  AdminManualPaymentMethodInput,
  AdminNotificationSettingsInput
} from '@/types/AdminSettings/adminSettingsTypes';

function showSuccess(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function showError(message: string) {
  notifications.show({ color: 'red', title: 'Action failed', message });
}

export function useAdminSettingsMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminSettingsQueryKey });

  const businessProfileMutation = useMutation({
    mutationFn: (input: AdminBusinessProfileInput) => updateAdminBusinessProfile(input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Business profile saved.');
      onDone();
    },
    onError: () => showError('Could not save business profile.')
  });

  const approvalSettingsMutation = useMutation({
    mutationFn: (input: AdminApprovalSettingsInput) => updateAdminApprovalSettings(input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Approval rules saved.');
      onDone();
    },
    onError: () => showError('Could not save approval rules.')
  });

  const notificationSettingsMutation = useMutation({
    mutationFn: (input: AdminNotificationSettingsInput) => updateAdminNotificationSettings(input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Notification channels saved.');
      onDone();
    },
    onError: () => showError('Could not save notification channels.')
  });

  const createManualMethodMutation = useMutation({
    mutationFn: (input: AdminManualPaymentMethodInput) => createAdminManualPaymentMethod(input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Payment method created.');
      onDone();
    },
    onError: () => showError('Could not create payment method.')
  });

  const updateManualMethodMutation = useMutation({
    mutationFn: (payload: { methodId: string; input: Partial<AdminManualPaymentMethodInput> }) =>
      updateAdminManualPaymentMethod(payload.methodId, payload.input),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Payment method saved.');
      onDone();
    },
    onError: () => showError('Could not save payment method.')
  });

  const activateManualMethodMutation = useMutation({
    mutationFn: (methodId: string) => activateAdminManualPaymentMethod(methodId),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Payment method activated.');
      onDone();
    },
    onError: () => showError('Could not activate payment method.')
  });

  const deactivateManualMethodMutation = useMutation({
    mutationFn: (methodId: string) => deactivateAdminManualPaymentMethod(methodId),
    onSuccess: async () => {
      await invalidate();
      showSuccess('Payment method deactivated.');
      onDone();
    },
    onError: () => showError('Could not deactivate payment method.')
  });

  return {
    businessProfileMutation,
    approvalSettingsMutation,
    notificationSettingsMutation,
    createManualMethodMutation,
    updateManualMethodMutation,
    activateManualMethodMutation,
    deactivateManualMethodMutation
  };
}
