'use client';

import { useState } from 'react';
import type { AdminNotificationLogModel } from '@/types/AdminNotification/adminNotificationTypes';

export function useAdminNotificationModals() {
  const [selected, setSelected] = useState<AdminNotificationLogModel | null>(null);
  const [retryOpen, setRetryOpen] = useState(false);

  return {
    selected,
    retryOpen,
    openRetry: (notification: AdminNotificationLogModel) => {
      setSelected(notification);
      setRetryOpen(true);
    },
    close: () => {
      setSelected(null);
      setRetryOpen(false);
    }
  };
}
