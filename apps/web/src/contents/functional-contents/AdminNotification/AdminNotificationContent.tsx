'use client';

import { SegmentedControl, SimpleGrid, Stack } from '@mantine/core';
import { useState } from 'react';

import { AdminNotificationRetryModal } from '@/components/functional-components/AdminNotification/AdminNotificationRetryModal';
import { AdminNotificationTable } from '@/components/functional-components/AdminNotification/AdminNotificationTable';
import { AppPageHeader } from '@/components/ui/app-page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';
import { adminNotificationStatusOptions } from '@/constants/AdminNotification/adminNotificationConstants';
import { useAdminNotificationModals } from '@/hooks/AdminNotification/useAdminNotificationModals';
import { useAdminNotificationMutations } from '@/hooks/AdminNotification/useAdminNotificationMutations';
import { useAdminNotificationQuery } from '@/hooks/AdminNotification/useAdminNotificationQuery';
import type { AdminNotificationStatus } from '@/types/AdminNotification/adminNotificationTypes';

export function AdminNotificationContent() {
  const [status, setStatus] = useState<AdminNotificationStatus | 'all'>('all');
  const notificationsQuery = useAdminNotificationQuery(status);
  const modals = useAdminNotificationModals();
  const mutations = useAdminNotificationMutations(modals.close);
  const notifications = notificationsQuery.data ?? [];
  const pendingCount = notifications.filter((notification) => notification.status === 'pending').length;
  const failedCount = notifications.filter((notification) => notification.status === 'failed').length;
  const sentCount = notifications.filter((notification) => notification.status === 'sent').length;

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AppPageHeader
          eyebrow="Message delivery"
          title="System Notification Logs"
          description="Track email, SMS, WhatsApp, and in-app delivery for this tenant."
          badge={`${notifications.length} loaded`}
        />

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <MetricCard label="Pending" value={pendingCount} hint="Waiting for worker" tone="orange" />
          <MetricCard label="Sent" value={sentCount} hint="Delivered or accepted" tone="green" />
          <MetricCard label="Failed" value={failedCount} hint="Needs review" tone="red" />
        </SimpleGrid>

        <SegmentedControl
          value={status}
          onChange={(value) => setStatus(value as AdminNotificationStatus | 'all')}
          data={adminNotificationStatusOptions}
          fullWidth
        />

        {notificationsQuery.isLoading ? (
          <StateCard loading title="Loading notifications..." description="Checking delivery logs." />
        ) : notifications.length === 0 ? (
          <StateCard title="No notifications found." description="New messages will appear here after orders, payments, or account actions." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
              <AdminNotificationTable notifications={notifications} onRetry={modals.openRetry} />
          </div>
        )}
      </Stack>

      <AdminNotificationRetryModal
        opened={modals.retryOpen}
        loading={mutations.retryMutation.isPending}
        notification={modals.selected}
        onClose={modals.close}
        onConfirm={() => {
          if (modals.selected) {
            mutations.retryMutation.mutate(modals.selected.id);
          }
        }}
      />
    </div>
  );
}
