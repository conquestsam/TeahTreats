'use client';

import { Button, Group, Modal, Select, Stack, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { AdminRoleModel, AdminTenantModel } from '@/types/AdminUser/adminUserTypes';
import type { AdminRoleAssignmentFormValues } from '@/validation/AdminUser/adminUserValidation';

interface AdminRoleAssignmentModalProps {
  opened: boolean;
  loading: boolean;
  roles: AdminRoleModel[];
  tenants: AdminTenantModel[];
  form: UseFormReturnType<AdminRoleAssignmentFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminRoleAssignmentModal({
  opened,
  loading,
  roles,
  tenants,
  form,
  onClose,
  onSubmit
}: AdminRoleAssignmentModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Assign Role" centered>
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Select
            label="Tenant"
            data={tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))}
            withAsterisk
            {...form.getInputProps('tenantId')}
          />
          <Select
            label="Role"
            data={roles.map((role) => ({ value: role.id, label: role.name }))}
            withAsterisk
            {...form.getInputProps('roleId')}
          />
          <Textarea label="Reason" placeholder="Short reason" {...form.getInputProps('reason')} />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Assign
            </Button>
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
