import { Paper, Text } from '@mantine/core';

export function AdminUserEmptyState() {
  return (
    <Paper withBorder p="xl">
      <Text fw={700}>No users yet.</Text>
      <Text c="dimmed" size="sm">
        Create the first team user to assign access.
      </Text>
    </Paper>
  );
}
