import { Loader, Paper, Stack, Text } from '@mantine/core';

export function AdminUserLoadingState() {
  return (
    <Paper withBorder p="xl">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed">Loading users...</Text>
      </Stack>
    </Paper>
  );
}
