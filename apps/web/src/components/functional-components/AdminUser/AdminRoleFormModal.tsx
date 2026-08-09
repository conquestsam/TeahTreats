'use client';

import { Button, Checkbox, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { AdminRoleFormValues } from '@/validation/AdminUser/adminUserValidation';

const permissionLabels: Record<string, string> = {
  'dashboard:read': 'Dashboard access',
  'reports:read': 'Reports access',
  'products:read': 'View products',
  'products:write': 'Manage products',
  'inventory:read': 'View inventory',
  'inventory:write': 'Manage inventory',
  'orders:read': 'View orders',
  'orders:write': 'Manage orders',
  'promotions:read': 'View promotions',
  'promotions:write': 'Manage promotions',
  'manual-payments:review': 'Review manual payments',
  'notifications:read': 'View notifications',
  'users:manage': 'Manage users',
  'roles:manage': 'Manage roles',
  'tenants:manage': 'Manage tenants',
  'audit:read': 'View audit logs'
};

interface AdminRoleFormModalProps {
  opened: boolean;
  loading: boolean;
  permissions: string[];
  form: UseFormReturnType<AdminRoleFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminRoleFormModal({
  opened,
  loading,
  permissions,
  form,
  onClose,
  onSubmit
}: AdminRoleFormModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Create Role" centered size="lg">
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput label="Role Name" withAsterisk {...form.getInputProps('name')} />
          <Checkbox.Group label="Permissions" withAsterisk {...form.getInputProps('permissions')}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
              {permissions.map((permission) => (
                <Checkbox key={permission} value={permission} label={permissionLabels[permission] ?? permission} />
              ))}
            </SimpleGrid>
          </Checkbox.Group>
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save
            </Button>
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
