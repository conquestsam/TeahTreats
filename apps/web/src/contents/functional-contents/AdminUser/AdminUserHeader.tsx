import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';

interface AdminUserHeaderProps {
  onCreateUser: () => void;
  onCreateRole: () => void;
}

export function AdminUserHeader({ onCreateUser, onCreateRole }: AdminUserHeaderProps) {
  return (
    <Paper withBorder p="xl" className="enterprise-panel">
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={2}>
        <Text size="xs" fw={800} tt="uppercase" c="green.7">
          Access management
        </Text>
        <Title order={1} className="text-3xl md:text-5xl">Users</Title>
        <Text c="dimmed">Manage team access and role approvals.</Text>
      </Stack>
      <Group>
        <Button variant="light" onClick={onCreateRole}>
          Create Role
        </Button>
        <Button onClick={onCreateUser}>Create User</Button>
      </Group>
    </Group>
    </Paper>
  );
}
