'use client';

import { Button, Group, Modal, Stack, Text, TextInput, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';
import type { UpdateInventoryBatchExpiryFormValues } from '@/validation/AdminInventory/adminInventoryValidation';

interface AdminInventoryExpiryModalProps {
  opened: boolean;
  loading: boolean;
  batch: AdminInventoryBatchModel | null;
  form: UseFormReturnType<UpdateInventoryBatchExpiryFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminInventoryExpiryModal({
  opened,
  loading,
  batch,
  form,
  onClose,
  onSubmit
}: AdminInventoryExpiryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Update Expiry"
      centered
      classNames={{ content: 'admin-mobile-modal-content', header: 'admin-mobile-modal-header', body: 'admin-mobile-modal-body' }}
    >
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {batch ? (
            <Text size="sm" c="dimmed">
              {batch.productName} - {batch.skuName}. Current expiry: {batch.expiresAt ? new Date(batch.expiresAt).toLocaleString() : 'Not set'}
            </Text>
          ) : null}
          <TextInput label="New expiry date" type="datetime-local" withAsterisk {...form.getInputProps('expiresAt')} />
          <Textarea label="Team note" placeholder="Extended after freshness review." withAsterisk {...form.getInputProps('reason')} />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Expiry
            </Button>
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
