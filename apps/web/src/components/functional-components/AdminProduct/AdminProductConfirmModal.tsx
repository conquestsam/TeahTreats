import { Button, Group, Modal, Stack, Text } from '@mantine/core';

export function AdminProductConfirmModal({
  opened,
  title,
  body,
  confirmLabel,
  loading,
  onClose,
  onConfirm
}: Readonly<{
  opened: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Text>{body}</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color={confirmLabel === 'Archive' ? 'red' : 'green'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
