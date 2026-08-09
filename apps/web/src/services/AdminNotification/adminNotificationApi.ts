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

export function smokeTestAdminNotifications(input: {
  channels: Array<'email' | 'sms' | 'whatsapp' | 'in_app'>;
  email?: string;
  phone?: string;
}) {
  return apiFetch<ApiEnvelope<{ created: number; results: Array<{ channel: string; status: string; message: string }> }>>(
    '/admin/notifications/smoke-test',
    {
      method: 'POST',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}
