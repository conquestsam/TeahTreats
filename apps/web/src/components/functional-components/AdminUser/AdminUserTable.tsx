import { Badge, Button, Group, Paper, Table, Text } from '@mantine/core';
import type { AdminUserModel } from '@/types/AdminUser/adminUserTypes';

interface AdminUserTableProps {
  users: AdminUserModel[];
  onEdit: (user: AdminUserModel) => void;
  onAssignRole: (user: AdminUserModel) => void;
  onRemoveRole: (user: AdminUserModel, userRole: AdminUserModel['roles'][number]) => void;
}

export function AdminUserTable({ users, onEdit, onAssignRole, onRemoveRole }: AdminUserTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={860}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Roles</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <AdminUserTableRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onAssignRole={onAssignRole}
                onRemoveRole={onRemoveRole}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

type AdminUserTableRowProps = Omit<AdminUserTableProps, 'users'> & {
  user: AdminUserModel;
};

function AdminUserTableRow({ user, onEdit, onAssignRole, onRemoveRole }: AdminUserTableRowProps) {
  const firstRole = user.roles[0];

  return (
    <Table.Tr>
      <Table.Td>
        <Text fw={700}>{user.name}</Text>
        <Text size="sm" c="dimmed">
          {user.email}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={6}>
          {user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge key={role.id} variant="light">
                {role.roleName}
              </Badge>
            ))
          ) : (
            <Text size="sm" c="dimmed">
              No roles
            </Text>
          )}
        </Group>
      </Table.Td>
      <Table.Td>{new Date(user.createdAt).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => onEdit(user)}>
            Edit
          </Button>
          <Button size="xs" onClick={() => onAssignRole(user)}>
            Assign Role
          </Button>
          {firstRole ? (
            <Button size="xs" color="red" variant="light" onClick={() => onRemoveRole(user, firstRole)}>
              Remove Role
            </Button>
          ) : null}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
