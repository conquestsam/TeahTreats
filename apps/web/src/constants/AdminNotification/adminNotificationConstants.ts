import type { AdminNotificationStatus } from '@/types/AdminNotification/adminNotificationTypes';

export const adminNotificationQueryKey = ['admin-notifications'] as const;

export const adminNotificationStatusOptions: Array<{ value: AdminNotificationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'skipped', label: 'Skipped' }
];
