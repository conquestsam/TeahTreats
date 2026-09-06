import { Loader, Paper, Stack, Text } from '@mantine/core';

export function AdminInventoryLoadingState() {
  return (
    <Paper withBorder p="xl">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed">Loading inventory...</Text>
      </Stack>
    </Paper>
  );
}
