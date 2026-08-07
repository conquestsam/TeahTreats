import { Badge, Button, Group, Paper, Table, Text } from '@mantine/core';
import type { AdminNotificationLogModel } from '@/types/AdminNotification/adminNotificationTypes';

interface AdminNotificationTableProps {
  notifications: AdminNotificationLogModel[];
  onRetry: (notification: AdminNotificationLogModel) => void;
}

export function AdminNotificationTable({ notifications, onRetry }: AdminNotificationTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={920}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Template</Table.Th>
              <Table.Th>Channel</Table.Th>
              <Table.Th>Recipient</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Attempts</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {notifications.map((notification) => (
              <Table.Tr key={notification.id}>
                <Table.Td>
                  <Text fw={700}>{formatValue(notification.templateKey ?? 'custom')}</Text>
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {notification.subject ?? notification.body}
                  </Text>
                </Table.Td>
                <Table.Td>{formatValue(notification.channel)}</Table.Td>
                <Table.Td>{notification.recipient ?? 'Missing'}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor(notification.status)} variant="light">
                    {formatValue(notification.status)}
                  </Badge>
                </Table.Td>
                <Table.Td>{notification.attempts}</Table.Td>
                <Table.Td>{new Date(notification.createdAt).toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      disabled={!['failed', 'skipped'].includes(notification.status)}
                      onClick={() => onRetry(notification)}
                    >
                      Retry
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

export function statusColor(status: string) {
  if (status === 'sent') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'skipped') return 'gray';
  if (status === 'processing') return 'blue';
  return 'orange';
}

export function formatValue(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ');
}
