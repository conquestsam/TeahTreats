'use client';

import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { useState } from 'react';

interface AdminUserConfirmModalProps {
  opened: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  color?: string;
  loading: boolean;
  askReason?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function AdminUserConfirmModal({
  opened,
  title,
  body,
  confirmLabel,
  color,
  loading,
  askReason,
  onClose,
  onConfirm
}: AdminUserConfirmModalProps) {
  const [reason, setReason] = useState('');

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Text size="sm">{body}</Text>
        {askReason ? (
          <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.currentTarget.value)} />
        ) : null}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button {...(color ? { color } : {})} loading={loading} onClick={() => onConfirm(reason)}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
