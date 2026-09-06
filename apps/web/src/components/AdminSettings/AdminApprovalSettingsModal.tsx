'use client';

import { Button, Group, Modal, Stack, Switch, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface ApprovalValues {
  delegatedRoleApprovalRequired: boolean;
}

interface AdminApprovalSettingsModalProps {
  opened: boolean;
  loading?: boolean;
  form: UseFormReturnType<ApprovalValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminApprovalSettingsModal({
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminApprovalSettingsModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Approval Rules" centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Switch
            label="Review delegated role changes"
            description="When this is on, delegated role changes wait for approval."
            {...form.getInputProps('delegatedRoleApprovalRequired', { type: 'checkbox' })}
          />
          <Text size="sm" c="dimmed">
            Super admins can still make direct changes.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={Boolean(loading)}>
              Save Rules
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
