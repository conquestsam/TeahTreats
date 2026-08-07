'use client';

import { Button, Group, Modal, MultiSelect, Stack } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { TenantNotificationChannel } from '@snacks/shared';
import { adminSettingsNotificationChannelOptions } from '@/constants/AdminSettings/adminSettingsConstants';

interface NotificationValues {
  orderReadinessNotificationChannels: TenantNotificationChannel[];
}

interface AdminNotificationChannelsModalProps {
  opened: boolean;
  loading?: boolean;
  form: UseFormReturnType<NotificationValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminNotificationChannelsModal({
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminNotificationChannelsModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Notification Channels" centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <MultiSelect
            label="Order ready alerts"
            description="Choose how customers are notified when orders are ready."
            data={adminSettingsNotificationChannelOptions}
            {...form.getInputProps('orderReadinessNotificationChannels')}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={Boolean(loading)}>
              Save Channels
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
