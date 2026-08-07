'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface AdminInventoryConfirmModalProps {
  opened: boolean;
  loading: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminInventoryConfirmModal({
  opened,
  loading,
  title,
  body,
  confirmLabel,
  onClose,
  onConfirm
}: AdminInventoryConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Text size="sm">{body}</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
