'use client';

import { Alert, Badge, Button, Group, SegmentedControl, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';

import { AdminNotificationRetryModal } from '@/components/AdminNotification/AdminNotificationRetryModal';
import { AdminNotificationTable } from '@/components/AdminNotification/AdminNotificationTable';
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
  const [testEmail, setTestEmail] = useState('');
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

        <Alert color="yellow" variant="light" title="Email smoke test">
          Use this before testing guest checkout. A green result means Gmail or Resend accepted the message; a failed row will show the provider error in the table.
        </Alert>

        <Group justify="flex-end" align="end">
          <TextInput
            label="Send test email to"
            placeholder="admin@example.com, or leave blank for tenant email"
            value={testEmail}
            onChange={(event) => setTestEmail(event.currentTarget.value)}
            className="min-w-[280px] flex-1 sm:flex-none"
          />
          <Button
            variant="light"
            loading={mutations.smokeTestMutation.isPending}
            onClick={() => {
              mutations.smokeTestMutation.mutate({
                channels: ['email'],
                ...(testEmail.trim() ? { email: testEmail.trim() } : {})
              });
            }}
          >
            Send Test Email
          </Button>
        </Group>

        {mutations.smokeTestMutation.data?.results.length ? (
          <Stack gap="xs">
            {mutations.smokeTestMutation.data.results.map((result) => (
              <Group key={`${result.channel}-${result.recipient}-${result.status}`} justify="space-between" className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#161419] px-4 py-3">
                <div>
                  <Text fw={800}>{result.recipient || 'Missing recipient'}</Text>
                  <Text size="sm" c="dimmed">{result.message}</Text>
                </div>
                <Badge color={result.status === 'sent' ? 'green' : result.status === 'failed' ? 'red' : 'gray'} variant="light">
                  {result.status}
                </Badge>
              </Group>
            ))}
          </Stack>
        ) : null}

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
