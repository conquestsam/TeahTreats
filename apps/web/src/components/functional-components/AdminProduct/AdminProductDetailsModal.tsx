'use client';

import { Badge, Button, Group, Image, Modal, Paper, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { AdminProductSkuForm } from './AdminProductSkuForm';
import { AdminProductSkuTable } from './AdminProductSkuTable';
import type { AdminProductImageModel, AdminProductModel } from '@/types/AdminProduct/adminProductTypes';

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

type AdminProductFormType = UseFormReturnType<{
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

export function AdminProductDetailsModal({
  opened,
  product,
  skuForm,
  skuLoading,
  productForm,
  productLoading,
  onClose,
  onAddSku,
  onSaveSnackDetails,
  onSaveSeo,
  onCreateImage,
  onEditImage,
  onRemoveImage
}: Readonly<{
  opened: boolean;
  product: AdminProductModel | null;
  skuForm: AdminProductSkuFormType;
  skuLoading: boolean;
  productForm: AdminProductFormType;
  productLoading: boolean;
  onClose: () => void;
  onAddSku: () => void;
  onSaveSnackDetails: () => void;
  onSaveSeo: () => void;
  onCreateImage: (product: AdminProductModel) => void;
  onEditImage: (product: AdminProductModel, image: AdminProductImageModel) => void;
  onRemoveImage: (product: AdminProductModel, image: AdminProductImageModel) => void;
}>) {
  return (
    <Modal opened={opened} onClose={onClose} title={product?.name ?? 'Product Details'} size="xl" centered>
      {product ? (
        <Stack>
          <Text c="dimmed">Review one section at a time. Save changes before moving to the next step.</Text>
          <Group>
            <Badge>{product.status}</Badge>
            <Text size="sm">{product.slug}</Text>
          </Group>
          <Tabs defaultValue="overview" keepMounted={false}>
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="skus">SKUs</Tabs.Tab>
              <Tabs.Tab value="images">Images</Tabs.Tab>
              <Tabs.Tab value="snack">Snack Details</Tabs.Tab>
              <Tabs.Tab value="seo">SEO</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Paper withBorder p="md">
                  <Text size="sm" c="dimmed">Brand</Text>
                  <Text fw={800}>{product.brand ?? 'Not set'}</Text>
                </Paper>
                <Paper withBorder p="md">
                  <Text size="sm" c="dimmed">Category</Text>
                  <Text fw={800}>{product.category ?? 'Not set'}</Text>
                </Paper>
                <Paper withBorder p="md">
                  <Text size="sm" c="dimmed">SKUs</Text>
                  <Text fw={800}>{product.skus.length}</Text>
                </Paper>
                <Paper withBorder p="md">
                  <Text size="sm" c="dimmed">Images</Text>
                  <Text fw={800}>{product.images.length}</Text>
                </Paper>
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="skus" pt="md">
              <Stack>
                <AdminProductSkuForm form={skuForm} loading={skuLoading} onSubmit={onAddSku} />
                <AdminProductSkuTable product={product} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="images" pt="md">
              <Stack>
                <Group justify="space-between">
                  <Text fw={800}>Product images</Text>
                  <Button onClick={() => onCreateImage(product)}>Add Image</Button>
                </Group>
                {product.images.length === 0 ? (
                  <Paper withBorder p="md">
                    <Text c="dimmed">No images yet.</Text>
                  </Paper>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    {product.images.map((image) => (
                      <Paper key={image.id} withBorder p="sm">
                        <Stack gap="sm">
                          <Image src={image.url} alt={image.alt ?? product.name} h={150} fit="cover" radius="md" />
                          <Text size="sm" fw={700} lineClamp={1}>{image.alt ?? 'No alt text'}</Text>
                          <Text size="xs" c="dimmed">Sort order {image.sortOrder}</Text>
                          <Group gap="xs">
                            <Button size="xs" variant="light" onClick={() => onEditImage(product, image)}>Edit</Button>
                            <Button size="xs" variant="light" color="red" onClick={() => onRemoveImage(product, image)}>Remove</Button>
                          </Group>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="snack" pt="md">
              <form onSubmit={productForm.onSubmit(onSaveSnackDetails)}>
                <Stack>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput label="Tags" placeholder="fresh, savory" {...productForm.getInputProps('tags')} />
                    <TextInput label="Dietary labels" placeholder="halal, vegetarian" {...productForm.getInputProps('dietaryLabels')} />
                    <TextInput label="Flavor" placeholder="Savory beef" {...productForm.getInputProps('flavor')} />
                    <TextInput label="Occasion" placeholder="Lunch" {...productForm.getInputProps('occasion')} />
                    <TextInput label="Ingredients" placeholder="flour, beef, butter" {...productForm.getInputProps('ingredients')} />
                    <TextInput label="Allergens" placeholder="wheat, milk" {...productForm.getInputProps('allergens')} />
                  </SimpleGrid>
                  <Textarea label="Nutrition facts" placeholder="calories: 420&#10;protein: 14g" autosize minRows={3} {...productForm.getInputProps('nutritionFacts')} />
                  <Textarea label="Storage instructions" autosize minRows={2} {...productForm.getInputProps('storageInstructions')} />
                  <Textarea label="Shelf-life notes" autosize minRows={2} {...productForm.getInputProps('shelfLifeNotes')} />
                  <Group justify="flex-end">
                    <Button type="submit" loading={productLoading}>Save Snack Details</Button>
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="seo" pt="md">
              <form onSubmit={productForm.onSubmit(onSaveSeo)}>
                <Stack>
                  <TextInput label="SEO title" {...productForm.getInputProps('seoTitle')} />
                  <Textarea label="SEO description" autosize minRows={3} {...productForm.getInputProps('seoDescription')} />
                  <Group justify="flex-end">
                    <Button type="submit" loading={productLoading}>Save SEO</Button>
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      ) : null}
    </Modal>
  );
}
