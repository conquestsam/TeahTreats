'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAuditLogQueryKey } from '@/constants/AdminSecurity/adminSecurityConstants';
import { disableAdminMfa, setupAdminMfa, verifyAdminMfa } from '@/services/AdminSecurity/adminSecurityApi';

function showError(error: unknown, message: string) {
  notifications.show({
    color: 'red',
    title: 'Security action failed',
    message: error instanceof Error ? error.message : message
  });
}

export function useAdminSecurityMutations(onDone?: () => void) {
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: setupAdminMfa,
    onError: (error) => showError(error, 'Could not start MFA setup.')
  });

  const verifyMutation = useMutation({
    mutationFn: verifyAdminMfa,
    onSuccess: () => {
      notifications.show({ color: 'green', title: 'MFA enabled', message: 'Admin MFA placeholder is enabled.' });
      void queryClient.invalidateQueries({ queryKey: adminAuditLogQueryKey });
      onDone?.();
    },
    onError: (error) => showError(error, 'Could not verify MFA.')
  });

  const disableMutation = useMutation({
    mutationFn: disableAdminMfa,
    onSuccess: () => {
      notifications.show({ color: 'green', title: 'MFA disabled', message: 'Admin MFA placeholder is disabled.' });
      onDone?.();
    },
    onError: (error) => showError(error, 'Could not disable MFA.')
  });

  return { setupMutation, verifyMutation, disableMutation };
}
