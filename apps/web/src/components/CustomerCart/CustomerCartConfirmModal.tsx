'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';

export function CustomerCartConfirmModal({
  opened,
  loading,
  itemName,
  onClose,
  onConfirm
}: {
  opened: boolean;
  loading: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Remove Item" centered>
      <Stack>
        <Text size="sm">Remove {itemName} from your cart?</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm}>
            Remove
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
