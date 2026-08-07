import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminNotificationLogModel } from '@/types/AdminNotification/adminNotificationTypes';
import { formatValue, statusColor } from './AdminNotificationTable';

export function AdminNotificationMobileCard({
  notification,
  onRetry
}: {
  notification: AdminNotificationLogModel;
  onRetry: (notification: AdminNotificationLogModel) => void;
}) {
  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={800}>{formatValue(notification.templateKey ?? 'custom')}</Text>
          <Badge color={statusColor(notification.status)} variant="light">
            {formatValue(notification.status)}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {notification.subject ?? notification.body}
        </Text>
        <Text size="sm">{formatValue(notification.channel)} to {notification.recipient ?? 'Missing recipient'}</Text>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {notification.attempts} attempts
          </Text>
          <Button
            size="xs"
            variant="light"
            disabled={!['failed', 'skipped'].includes(notification.status)}
            onClick={() => onRetry(notification)}
          >
            Retry
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
