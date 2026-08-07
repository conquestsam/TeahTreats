'use client';

import { useQuery } from '@tanstack/react-query';
import { adminNotificationQueryKey } from '@/constants/AdminNotification/adminNotificationConstants';
import { listAdminNotifications } from '@/services/AdminNotification/adminNotificationApi';
import type { AdminNotificationStatus } from '@/types/AdminNotification/adminNotificationTypes';

export function useAdminNotificationQuery(status: AdminNotificationStatus | 'all') {
  return useQuery({
    queryKey: [...adminNotificationQueryKey, status],
    queryFn: () => listAdminNotifications(status)
  });
}
