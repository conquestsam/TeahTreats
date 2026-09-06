'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface AdminTenantReactivateModalProps {
  opened: boolean;
  tenantName: string | undefined;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminTenantReactivateModal({
  opened,
  tenantName,
  loading,
  onClose,
  onConfirm
}: AdminTenantReactivateModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Reactivate Tenant" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Reactivate {tenantName ?? 'this tenant'} so assigned users can access its catalog, stock, and orders again.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button color="green" loading={Boolean(loading)} onClick={onConfirm}>
            Reactivate
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
