'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface AdminSettingsConfirmModalProps {
  opened: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  color?: 'green' | 'red';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminSettingsConfirmModal({
  opened,
  title,
  description,
  confirmLabel,
  color = 'green',
  loading,
  onClose,
  onConfirm
}: AdminSettingsConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {description}
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button color={color} loading={Boolean(loading)} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
