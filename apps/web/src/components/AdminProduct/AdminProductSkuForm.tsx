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
        <Text fw={700}>Add Price Option</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Option name" placeholder="Single box" {...form.getInputProps('name')} />
          <NumberInput
            label="Price (USD)"
            min={0.01}
            decimalScale={2}
            fixedDecimalScale
            prefix="$"
            {...form.getInputProps('priceCents')}
          />
          <TextInput label="Size" placeholder="6 oz" {...form.getInputProps('size')} />
          <NumberInput label="Pack count" min={1} {...form.getInputProps('packCount')} />
          <TextInput label="Unit label" placeholder="box, tray, bottle" {...form.getInputProps('unitLabel')} />
          <TextInput label="Barcode" placeholder="Optional UPC" {...form.getInputProps('barcode')} />
        </SimpleGrid>
        <Group justify="space-between">
          <Group>
            <Switch label="Available" {...form.getInputProps('active', { type: 'checkbox' })} />
            <Switch label="Perishable" {...form.getInputProps('perishableOverride', { type: 'checkbox' })} />
          </Group>
          <Button type="submit" loading={loading}>
            Add Price
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
