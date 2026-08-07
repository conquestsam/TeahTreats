import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';

export function AdminInventoryHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <Paper withBorder p="xl" className="enterprise-panel">
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={2}>
        <Text size="xs" fw={800} tt="uppercase" c="green.7">
          Perishable stock
        </Text>
        <Title order={1} className="text-3xl md:text-5xl">Inventory</Title>
        <Text c="dimmed">Track stock batches, expiry, and reservations.</Text>
      </Stack>
      <Button onClick={onCreate}>Create Batch</Button>
    </Group>
    </Paper>
  );
}
