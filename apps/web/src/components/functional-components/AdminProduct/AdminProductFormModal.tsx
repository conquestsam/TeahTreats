'use client';

import { Button, Group, Modal, Select, Stack, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import { adminProductStatusOptions } from '@/constants/AdminProduct/adminProductConstants';
import type { AdminProductModalMode } from '@/types/AdminProduct/adminProductTypes';

type AdminProductForm = UseFormReturnType<{
  name: string;
  slug: string;
  description: string;
  status: string;
  brand: string;
  category: string;
  tags: string;
  flavor: string;
  occasion: string;
  ingredients: string;
  allergens: string;
  nutritionFacts: string;
  dietaryLabels: string;
  isPerishable: boolean;
  storageInstructions: string;
  shelfLifeNotes: string;
  bundleEligible: boolean;
  seoTitle: string;
  seoDescription: string;
}>;

export function AdminProductFormModal({
  mode,
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: Readonly<{
  mode: AdminProductModalMode;
  opened: boolean;
  loading: boolean;
  form: AdminProductForm;
  onClose: () => void;
  onSubmit: () => void;
}>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Create Product' : 'Edit Product'}
      centered
    >
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={form.onSubmit(onSubmit)}
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Fresh Meat Pie"
            withAsterisk
            {...form.getInputProps('name')}
          />
          {mode === 'create' ? (
            <TextInput label="Slug" placeholder="fresh-meat-pie" {...form.getInputProps('slug')} />
          ) : null}
          <Textarea
            label="Description"
            placeholder="Short product description"
            {...form.getInputProps('description')}
          />
          <Group grow>
            <TextInput label="Brand" placeholder="Snacks Kitchen" {...form.getInputProps('brand')} />
            <TextInput label="Category" placeholder="Fresh Bites" {...form.getInputProps('category')} />
          </Group>
          <Select label="Status" data={[...adminProductStatusOptions]} {...form.getInputProps('status')} />
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
