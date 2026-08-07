'use client';

import { Button, Group, NumberInput, SimpleGrid, Stack, Switch, Text, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

type AdminProductSkuFormType = UseFormReturnType<{
  name: string;
  priceCents: number;
  currency: string;
  active: boolean;
  size: string;
  packCount: number;
  unitLabel: string;
  barcode: string;
  weight: string;
  dimensions: string;
  perishableOverride: boolean;
}>;

export function AdminProductSkuForm({
  form,
  loading,
  onSubmit
}: Readonly<{ form: AdminProductSkuFormType; loading: boolean; onSubmit: () => void }>) {
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Text fw={700}>Add SKU</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="SKU name" placeholder="Single pie" {...form.getInputProps('name')} />
          <NumberInput label="Price in cents" min={1} {...form.getInputProps('priceCents')} />
          <TextInput label="Size" placeholder="6 oz" {...form.getInputProps('size')} />
          <NumberInput label="Pack count" min={1} {...form.getInputProps('packCount')} />
          <TextInput label="Unit label" placeholder="box" {...form.getInputProps('unitLabel')} />
          <TextInput label="Barcode" placeholder="Optional UPC" {...form.getInputProps('barcode')} />
        </SimpleGrid>
        <Group justify="space-between">
          <Group>
            <Switch label="Active" {...form.getInputProps('active', { type: 'checkbox' })} />
            <Switch label="Perishable" {...form.getInputProps('perishableOverride', { type: 'checkbox' })} />
          </Group>
          <Button type="submit" loading={loading}>
            Add SKU
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
