'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminNotificationQueryKey } from '@/constants/AdminNotification/adminNotificationConstants';
import { retryAdminNotification, smokeTestAdminNotifications } from '@/services/AdminNotification/adminNotificationApi';

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

  const smokeTestMutation = useMutation({
    mutationFn: smokeTestAdminNotifications,
    onSuccess: (result) => {
      const failed = result.results.filter((item) => item.status === 'failed').length;
      const skipped = result.results.filter((item) => item.status === 'skipped').length;
      notifications.show({
        color: failed > 0 ? 'red' : skipped > 0 ? 'yellow' : 'green',
        title: 'Smoke test finished',
        message: `${result.results.length} channel checks completed. ${failed} failed, ${skipped} skipped.`
      });
      void queryClient.invalidateQueries({ queryKey: adminNotificationQueryKey });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Smoke test failed',
        message: error instanceof Error ? error.message : 'The notification smoke test could not run.'
      });
    }
  });

  return { retryMutation, smokeTestMutation };
}
