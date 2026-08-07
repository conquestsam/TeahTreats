'use client';

import { Button, Group, Modal, Stack, Switch, TextInput, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface ManualPaymentMethodValues {
  key: string;
  label: string;
  instructions: string;
  active: boolean;
}

interface AdminManualPaymentMethodModalProps {
  mode: 'create' | 'edit';
  opened: boolean;
  loading?: boolean;
  form: UseFormReturnType<ManualPaymentMethodValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminManualPaymentMethodModal({
  mode,
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminManualPaymentMethodModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Create Payment Method' : 'Edit Payment Method'}
      centered
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput label="Key" placeholder="zelle" {...form.getInputProps('key')} />
          <TextInput label="Name" placeholder="Zelle" {...form.getInputProps('label')} />
          <Textarea
            label="Instructions"
            placeholder="Send payment to billing@example.com and upload your receipt."
            minRows={4}
            {...form.getInputProps('instructions')}
          />
          <Switch label="Active" {...form.getInputProps('active', { type: 'checkbox' })} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={Boolean(loading)}>
              {mode === 'create' ? 'Create Method' : 'Save Method'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
