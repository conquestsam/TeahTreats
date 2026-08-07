import { Paper, Text } from '@mantine/core';

export function AdminInventoryEmptyState() {
  return (
    <Paper withBorder p="xl">
      <Text fw={700}>No inventory batches yet.</Text>
      <Text c="dimmed" size="sm">
        Create a batch when stock arrives.
      </Text>
    </Paper>
  );
}
