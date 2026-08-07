'use client';

import { Button, Group, Modal, NumberInput, Select, Stack, TextInput, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { AdminInventorySkuOptionModel } from '@/types/AdminInventory/adminInventoryTypes';
import type { CreateInventoryBatchFormValues } from '@/validation/AdminInventory/adminInventoryValidation';

interface AdminInventoryCreateBatchModalProps {
  opened: boolean;
  loading: boolean;
  skus: AdminInventorySkuOptionModel[];
  form: UseFormReturnType<CreateInventoryBatchFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminInventoryCreateBatchModal({
  opened,
  loading,
  skus,
  form,
  onClose,
  onSubmit
}: AdminInventoryCreateBatchModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Create Batch" centered>
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Select
            label="SKU"
            data={skus.map((sku) => ({
              value: sku.id,
              label: `${sku.productName} - ${sku.name}${sku.isPerishable ? ' (perishable)' : ''}`
            }))}
            withAsterisk
            {...form.getInputProps('skuId')}
          />
          <NumberInput label="Quantity" min={0} withAsterisk {...form.getInputProps('quantity')} />
          <TextInput
            label="Expiry Date"
            type="datetime-local"
            description="Required for perishable stock."
            {...form.getInputProps('expiresAt')}
          />
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
