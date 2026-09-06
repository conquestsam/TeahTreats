'use client';

import { Badge, Button, Group, Image, Modal, NumberInput, Select, SimpleGrid, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
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
  const selectedSku = skus.find((sku) => sku.id === form.values.skuId) ?? null;
  const nextAvailable = (selectedSku?.available ?? 0) + form.values.quantity;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Receive Inventory Batch"
      centered
      size="lg"
      classNames={{ content: 'admin-mobile-modal-content', header: 'admin-mobile-modal-header', body: 'admin-mobile-modal-body' }}
    >
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="lg">
          <div>
            <Text fw={900}>Receive Inventory Batch</Text>
            <Text size="sm" c="dimmed">Record incoming stock from kitchen prep or supplier delivery.</Text>
          </div>
          <Select
            label="Product option"
            data={skus.map((sku) => ({
              value: sku.id,
              label: `${sku.productName} - ${sku.name}${sku.isPerishable ? ' (perishable)' : ''}`
            }))}
            withAsterisk
            {...form.getInputProps('skuId')}
          />
          {selectedSku ? (
            <div className="admin-inventory-selected-sku">
              <span className="admin-mobile-item-thumb">
                {selectedSku.imageUrl ? <Image src={selectedSku.imageUrl} alt={selectedSku.productName} /> : null}
              </span>
              <div>
                <Text fw={850}>{selectedSku.productName}</Text>
                <Text size="sm" c="dimmed">{selectedSku.name}</Text>
                <Text size="xs" style={{ color: '#ffd98a' }}>Current stock: {selectedSku.available} {selectedSku.unitLabel}</Text>
              </div>
              <Badge color={selectedSku.active ? 'green' : 'gray'} variant="light">{selectedSku.active ? 'Available' : 'Hidden'}</Badge>
            </div>
          ) : null}

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput label="Quantity received" min={0} withAsterisk {...form.getInputProps('quantity')} />
            <TextInput label="Batch identifier" placeholder="BATCH-20260218-LK" {...form.getInputProps('batchCode')} />
            <TextInput label="Expiry date" type="datetime-local" description="Required for perishable stock." {...form.getInputProps('expiresAt')} />
            <TextInput label="Kitchen location" placeholder="Cold Room 01" {...form.getInputProps('storageLocation')} />
            <TextInput label="Storage zone" placeholder="Bakery Station" {...form.getInputProps('storageZone')} />
            <Select
              label="Source"
              data={['Internal Kitchen', 'External Supplier', 'Returned Stock']}
              {...form.getInputProps('source')}
            />
          </SimpleGrid>

          <div className="admin-inventory-stock-preview">
            <div>
              <Text size="xs" fw={900} tt="uppercase">Current</Text>
              <Text fw={950}>{selectedSku?.available ?? 0}</Text>
            </div>
            <div>
              <Text size="xs" fw={900} tt="uppercase">Incoming</Text>
              <Text fw={950}>+{form.values.quantity}</Text>
            </div>
            <div>
              <Text size="xs" fw={900} tt="uppercase">New Available</Text>
              <Text fw={950}>{nextAvailable}</Text>
            </div>
          </div>

          <Switch label="Quality & hygiene passed" {...form.getInputProps('qualityChecked', { type: 'checkbox' })} />
          <Textarea label="Team note" withAsterisk placeholder="Fresh batch received." {...form.getInputProps('reason')} />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Confirm & Add to Inventory
            </Button>
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
