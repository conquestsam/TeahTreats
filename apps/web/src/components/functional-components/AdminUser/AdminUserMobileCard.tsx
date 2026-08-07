import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminUserModel } from '@/types/AdminUser/adminUserTypes';

interface AdminUserMobileCardProps {
  user: AdminUserModel;
  onEdit: (user: AdminUserModel) => void;
  onAssignRole: (user: AdminUserModel) => void;
  onRemoveRole: (user: AdminUserModel, userRole: AdminUserModel['roles'][number]) => void;
}

export function AdminUserMobileCard({
  user,
  onEdit,
  onAssignRole,
  onRemoveRole
}: AdminUserMobileCardProps) {
  const firstRole = user.roles[0];

  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <div>
          <Text fw={700}>{user.name}</Text>
          <Text size="sm" c="dimmed">
            {user.email}
          </Text>
        </div>
        <Group gap={6}>
          {user.roles.map((role) => (
            <Badge key={role.id} variant="light">
              {role.roleName}
            </Badge>
          ))}
        </Group>
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => onEdit(user)}>
            Edit
          </Button>
          <Button size="xs" onClick={() => onAssignRole(user)}>
            Assign
          </Button>
          {firstRole ? (
            <Button size="xs" color="red" variant="light" onClick={() => onRemoveRole(user, firstRole)}>
              Remove
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Paper>
  );
}
