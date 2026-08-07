'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface AdminPromotionArchiveModalProps {
  opened: boolean;
  promotionName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminPromotionArchiveModal({
  opened,
  promotionName,
  loading,
  onClose,
  onConfirm
}: AdminPromotionArchiveModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Archive Promotion" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {promotionName ?? 'This promotion'} will stop being available to customers.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={Boolean(loading)} onClick={onConfirm}>
            Archive
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
