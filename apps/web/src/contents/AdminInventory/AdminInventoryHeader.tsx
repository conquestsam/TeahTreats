import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';

export function AdminInventoryHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <Paper withBorder p="xl" className="enterprise-panel admin-inventory-header">
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={2}>
        <Text size="xs" fw={800} tt="uppercase" style={{ color: '#ffd98a' }}>
          Kitchen Stock
        </Text>
        <Title order={1} className="text-3xl md:text-5xl">Inventory & Batches</Title>
        <Text c="dimmed">Receive, adjust, and review stock before it reaches customers.</Text>
      </Stack>
      <Button className="tt-btn-primary" onClick={onCreate}>+ Add Batch</Button>
    </Group>
    </Paper>
  );
}
