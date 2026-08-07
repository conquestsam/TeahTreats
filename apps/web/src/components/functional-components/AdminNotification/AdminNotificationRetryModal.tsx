import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import type { AdminNotificationLogModel } from '@/types/AdminNotification/adminNotificationTypes';

export function AdminNotificationRetryModal({
  opened,
  loading,
  notification,
  onClose,
  onConfirm
}: {
  opened: boolean;
  loading: boolean;
  notification: AdminNotificationLogModel | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Retry Notification" centered>
      <Stack>
        <Text size="sm">
          Retry this {notification?.channel ?? 'notification'} message?
        </Text>
        {notification?.lastError ? (
          <Text size="sm" c="red">
            Last error: {notification.lastError}
          </Text>
        ) : null}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={onConfirm}>
            Retry
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
