'use client';

import { Button, Group, Modal, NumberInput, Stack, Text, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';
import type { AdjustInventoryBatchFormValues } from '@/validation/AdminInventory/adminInventoryValidation';

interface AdminInventoryAdjustModalProps {
  opened: boolean;
  loading: boolean;
  batch: AdminInventoryBatchModel | null;
  form: UseFormReturnType<AdjustInventoryBatchFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminInventoryAdjustModal({
  opened,
  loading,
  batch,
  form,
  onClose,
  onSubmit
}: AdminInventoryAdjustModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Adjust Stock" centered>
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {batch ? (
            <Text size="sm" c="dimmed">
              {batch.productName} - {batch.skuName}. Available: {batch.available}
            </Text>
          ) : null}
          <NumberInput label="Adjustment" withAsterisk {...form.getInputProps('quantityDelta')} />
          <Textarea label="Reason" withAsterisk {...form.getInputProps('reason')} />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save
            </Button>
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
