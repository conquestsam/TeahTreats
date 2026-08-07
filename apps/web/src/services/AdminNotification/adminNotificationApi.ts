import { apiFetch } from '@/lib/api/client';
import type {
  AdminNotificationLogModel,
  AdminNotificationStatus
} from '@/types/AdminNotification/adminNotificationTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listAdminNotifications(status: AdminNotificationStatus | 'all') {
  const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`;
  return apiFetch<ApiEnvelope<AdminNotificationLogModel[]>>(`/admin/notifications${query}`).then(
    (response) => response.data,
  );
}

export function retryAdminNotification(notificationId: string) {
  return apiFetch<ApiEnvelope<{ id: string; status: string; attempts: number; lastError: string | null }>>(
    `/admin/notifications/${notificationId}/retry`,
    { method: 'POST' },
  ).then((response) => response.data);
}
