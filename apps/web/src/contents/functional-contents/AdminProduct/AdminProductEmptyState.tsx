import { Paper, Text } from '@mantine/core';

export function AdminProductEmptyState() {
  return (
    <Paper withBorder p="lg">
      <Text fw={700}>No products yet.</Text>
      <Text c="dimmed">Create your first product to begin catalog setup.</Text>
    </Paper>
  );
}
