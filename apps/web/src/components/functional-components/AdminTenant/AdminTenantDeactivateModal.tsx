'use client';

import { Button, Checkbox, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface DeactivateFormValues {
  reason: string;
  force: boolean;
}

interface AdminTenantDeactivateModalProps {
  opened: boolean;
  tenantName: string | undefined;
  loading?: boolean;
  form: UseFormReturnType<DeactivateFormValues>;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminTenantDeactivateModal({
  opened,
  tenantName,
  loading,
  form,
  onClose,
  onConfirm
}: AdminTenantDeactivateModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Deactivate Tenant" centered>
      <form onSubmit={form.onSubmit(onConfirm)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Deactivate {tenantName ?? 'this tenant'} only when open paid, preparing, or ready orders are clear.
          </Text>
          <Textarea
            label="Reason"
            placeholder="Why is this tenant being deactivated?"
            minRows={3}
            {...form.getInputProps('reason')}
          />
          <Checkbox
            label="Force if allowed"
            description="Only super admins can force deactivation with open orders."
            {...form.getInputProps('force', { type: 'checkbox' })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button color="red" type="submit" loading={Boolean(loading)}>
              Deactivate
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
