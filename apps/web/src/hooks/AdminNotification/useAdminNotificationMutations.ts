'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminNotificationQueryKey } from '@/constants/AdminNotification/adminNotificationConstants';
import { retryAdminNotification } from '@/services/AdminNotification/adminNotificationApi';

export function useAdminNotificationMutations(onDone: () => void) {
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: retryAdminNotification,
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Notification queued',
        message: 'The notification will be retried by the worker.'
      });
      void queryClient.invalidateQueries({ queryKey: adminNotificationQueryKey });
      onDone();
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Retry failed',
        message: error instanceof Error ? error.message : 'The notification could not be queued.'
      });
    }
  });

  return { retryMutation };
}
