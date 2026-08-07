'use client';

import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { AdminUserFormValues } from '@/validation/AdminUser/adminUserValidation';

interface AdminUserFormModalProps {
  mode: 'create' | 'edit';
  opened: boolean;
  loading: boolean;
  form: UseFormReturnType<AdminUserFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminUserFormModal({
  mode,
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminUserFormModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={mode === 'create' ? 'Create User' : 'Edit User'} centered>
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {mode === 'create' ? (
            <TextInput label="Email" withAsterisk {...form.getInputProps('email')} />
          ) : null}
          <TextInput label="Name" withAsterisk {...form.getInputProps('name')} />
          <TextInput label="Phone" {...form.getInputProps('phone')} />
          {mode === 'create' ? (
            <TextInput
              label="Temporary Password"
              placeholder="Password#23"
              {...form.getInputProps('temporaryPassword')}
            />
          ) : null}
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
