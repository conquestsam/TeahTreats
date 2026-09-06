'use client';

import { Button, FileInput, Group, Modal, Select, SimpleGrid, Stack, Stepper, Switch, Text, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { adminProductStatusOptions } from '@/constants/AdminProduct/adminProductConstants';
import type { AdminProductModel } from '@/types/AdminProduct/adminProductTypes';
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
  uploadLoading = false,
  createdProduct,
  uploadedImageCount = 0,
  form,
  onClose,
  onSubmit,
  onUploadFiles
}: Readonly<{
  mode: AdminProductModalMode;
  opened: boolean;
  loading: boolean;
  uploadLoading?: boolean;
  createdProduct?: AdminProductModel | null;
  uploadedImageCount?: number;
  form: AdminProductForm;
  onClose: () => void;
  onSubmit: () => void;
  onUploadFiles?: (files: File[]) => void;
}>) {
  const [active, setActive] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const isCreate = mode === 'create';
  const productIsSaved = !isCreate || Boolean(createdProduct);

  useEffect(() => {
    if (opened) {
      setActive(0);
      setImageFiles([]);
    }
  }, [opened, mode]);

  useEffect(() => {
    if (opened && isCreate && createdProduct && active === 0) {
      setActive(1);
    }
  }, [active, createdProduct, isCreate, opened]);

  const nextStep = () => setActive((current) => Math.min(current + 1, 3));
  const previousStep = () => setActive((current) => Math.max(current - 1, 0));
  const saveBasics = () => form.onSubmit(onSubmit)();
  const uploadSelectedImages = () => {
    if (imageFiles.length > 0) {
      onUploadFiles?.(imageFiles);
      setImageFiles([]);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isCreate ? 'Create Menu Item' : 'Edit Menu Item'}
      centered
      size="xl"
    >
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(event) => event.preventDefault()}
      >
        <Stack gap="lg">
          <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={productIsSaved || !isCreate}>
            <Stepper.Step label="Basic Details" description="Name and category">
              <Stack mt="md">
                <TextInput
                  label="Product name"
                  placeholder="Fresh Meat Pie"
                  withAsterisk
                  {...form.getInputProps('name')}
                />
                {isCreate ? (
                  <TextInput label="Slug" placeholder="fresh-meat-pie" {...form.getInputProps('slug')} />
                ) : null}
                <Textarea
                  label="Description"
                  placeholder="Short product description"
                  autosize
                  minRows={3}
                  {...form.getInputProps('description')}
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput label="Kitchen or brand" placeholder="Central Kitchen" {...form.getInputProps('brand')} />
                  <TextInput label="Menu category" placeholder="Fresh Bites" {...form.getInputProps('category')} />
                </SimpleGrid>
                <Select label="Status" data={[...adminProductStatusOptions]} {...form.getInputProps('status')} />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Menu Details" description="Ingredients and storage">
              <Stack mt="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput label="Flavor" placeholder="Spicy, sweet, buttery" {...form.getInputProps('flavor')} />
                  <TextInput label="Occasion" placeholder="Office, gift, party" {...form.getInputProps('occasion')} />
                </SimpleGrid>
                <TextInput label="Tags" placeholder="fresh, baked, party" {...form.getInputProps('tags')} />
                <TextInput label="Dietary labels" placeholder="halal, vegetarian" {...form.getInputProps('dietaryLabels')} />
                <Textarea label="Ingredients" placeholder="Separate items with commas" autosize minRows={2} {...form.getInputProps('ingredients')} />
                <Textarea label="Allergens" placeholder="Separate allergens with commas" autosize minRows={2} {...form.getInputProps('allergens')} />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Switch label="Perishable" {...form.getInputProps('isPerishable', { type: 'checkbox' })} />
                  <Switch label="Eligible for bundles" {...form.getInputProps('bundleEligible', { type: 'checkbox' })} />
                </SimpleGrid>
                <Textarea label="Storage instructions" autosize minRows={2} {...form.getInputProps('storageInstructions')} />
                <Textarea label="Shelf-life notes" autosize minRows={2} {...form.getInputProps('shelfLifeNotes')} />
                <Textarea label="Nutrition notes" description="Example: Calories: 240" autosize minRows={3} {...form.getInputProps('nutritionFacts')} />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Storefront Preview" description="How it appears online">
              <Stack mt="md">
                <TextInput label="Page title" placeholder="Fresh meat pies for office snacks" {...form.getInputProps('seoTitle')} />
                <Textarea label="Short search description" autosize minRows={3} {...form.getInputProps('seoDescription')} />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Photos" description="Upload product images">
              <Stack mt="md">
                {productIsSaved ? (
                  <>
                    <Text size="sm" c="dimmed">
                      Add clear product photos so customers know exactly what they are ordering.
                    </Text>
                    <FileInput
                      label="Product images"
                      placeholder="Choose one or more images"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      value={imageFiles}
                      onChange={(value) => setImageFiles(value)}
                    />
                    <Text size="sm" c="dimmed">Uploaded in this flow: {uploadedImageCount}</Text>
                    <Button
                      variant="light"
                      disabled={imageFiles.length === 0}
                      loading={uploadLoading}
                      onClick={uploadSelectedImages}
                    >
                      Upload Photos
                    </Button>
                  </>
                ) : (
                  <Text size="sm" c="dimmed">
                    Save the basic product details first, then add photos.
                  </Text>
                )}
              </Stack>
            </Stepper.Step>
          </Stepper>

          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              {productIsSaved && active === 3 ? 'Finish' : 'Cancel'}
            </Button>
            {active > 0 ? (
              <Button variant="subtle" onClick={previousStep}>
                Back
              </Button>
            ) : null}
            {active < 3 ? (
              <Button
                onClick={() => {
                  if (active === 0) {
                    if (isCreate && !productIsSaved) {
                      saveBasics();
                      return;
                    }
                    saveBasics();
                    nextStep();
                    return;
                  }
                  if (active === 1) {
                    nextStep();
                    return;
                  }
                  if (active === 2) {
                    saveBasics();
                    nextStep();
                    return;
                  }
                  nextStep();
                }}
                loading={(active === 0 || active === 2) && loading}
              >
                {active === 0 && isCreate && !productIsSaved
                  ? 'Create and Continue'
                  : active === 0 || active === 2
                  ? 'Save and Continue'
                  : 'Next'}
              </Button>
            ) : null}
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
