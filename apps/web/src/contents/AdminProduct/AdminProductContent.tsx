'use client';

import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useMemo } from 'react';
import { AdminProductConfirmModal } from '@/components/AdminProduct/AdminProductConfirmModal';
import { AdminProductDetailsModal } from '@/components/AdminProduct/AdminProductDetailsModal';
import { AdminProductFormModal } from '@/components/AdminProduct/AdminProductFormModal';
import { AdminProductImageModal } from '@/components/AdminProduct/AdminProductImageModal';

import { useState } from 'react';
import { AdminProductGrid } from '@/components/AdminProduct/AdminProductGrid';
import { AdminProductMobileCard } from '@/components/AdminProduct/AdminProductMobileCard';
import { AdminProductTable } from '@/components/AdminProduct/AdminProductTable';
import { useAdminProductForm, useAdminProductImageForm } from '@/hooks/AdminProduct/useAdminProductForm';
import { useAdminProductModals } from '@/hooks/AdminProduct/useAdminProductModals';
import { useAdminProductMutations } from '@/hooks/AdminProduct/useAdminProductMutations';
import { useAdminProductQuery } from '@/hooks/AdminProduct/useAdminProductQuery';
import { useAdminProductSkuForm } from '@/hooks/AdminProduct/useAdminProductSkuForm';
import type { AdminProductModel } from '@/types/AdminProduct/adminProductTypes';
import { MetricCard } from '@/components/ui/metric-card';
import { AdminProductEmptyState } from './AdminProductEmptyState';
import { AdminProductHeader } from './AdminProductHeader';
import { AdminProductLoadingState } from './AdminProductLoadingState';

export function AdminProductContent() {
  const modals = useAdminProductModals();
  const productsQuery = useAdminProductQuery();
  const productForm = useAdminProductForm();
  const imageForm = useAdminProductImageForm();
  const skuForm = useAdminProductSkuForm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [wizardUploadedImageCount, setWizardUploadedImageCount] = useState(0);
  const [selectedListProductId, setSelectedListProductId] = useState<string | null>(null);

  const resetAndClose = () => {
    productForm.reset();
    imageForm.reset();
    skuForm.reset();
    setWizardUploadedImageCount(0);
    modals.closeModal();
  };

  const mutations = useAdminProductMutations({
    onProductCreated: (product) => {
      modals.setSelectedProduct(product);
      setWizardUploadedImageCount(0);
    },
    onProductSaved: resetAndClose,
    onSkuSaved: () => skuForm.reset()
  });

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter !== 'all' && product.status !== statusFilter) {
        return false;
      }
      if (categoryFilter === '__low_stock' && product.lowStockSkuCount === 0) {
        return false;
      }
      if (categoryFilter !== 'all' && categoryFilter !== '__low_stock' && product.category !== categoryFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSlug = product.slug.toLowerCase().includes(q);
        const matchCategory = product.category?.toLowerCase().includes(q) ?? false;
        const matchBrand = product.brand?.toLowerCase().includes(q) ?? false;
        const matchSku = product.skus.some((sku) => sku.name.toLowerCase().includes(q));
        if (!matchName && !matchSlug && !matchBrand && !matchCategory && !matchSku) {
          return false;
        }
      }
      return true;
    });
  }, [products, statusFilter, categoryFilter, search]);

  const selectedFreshProduct = useMemo(
    () =>
      products.find((product) => product.id === modals.selectedProduct?.id) ??
      modals.selectedProduct,
    [products, modals.selectedProduct],
  );

  const selectedListProduct = useMemo(
    () =>
      filteredProducts.find((product) => product.id === selectedListProductId) ??
      filteredProducts[0] ??
      null,
    [filteredProducts, selectedListProductId],
  );

  useEffect(() => {
    if (selectedListProductId && filteredProducts.some((product) => product.id === selectedListProductId)) {
      return;
    }
    setSelectedListProductId(filteredProducts[0]?.id ?? null);
  }, [filteredProducts, selectedListProductId]);

  const openCreate = () => {
    productForm.reset();
    setWizardUploadedImageCount(0);
    modals.openCreate();
  };

  const fillProductForm = (product: AdminProductModel) => {
    productForm.setValues(fillProductFormFromModel(product));
  };

  const openEdit = (product: AdminProductModel) => {
    fillProductForm(product);
    modals.openEdit(product);
  };

  const openDetails = (product: AdminProductModel) => {
    fillProductForm(product);
    modals.openDetails(product);
  };

  const openCreateImage = (product: AdminProductModel) => {
    imageForm.setValues({
      url: '',
      objectKey: '',
      storageProvider: 'cloudinary',
      contentType: 'image/jpeg',
      alt: '',
      sortOrder: product.images.length
    });
    modals.openCreateImage(product);
  };

  const openEditImage = (product: AdminProductModel, image: AdminProductModel['images'][number]) => {
    imageForm.setValues({
      url: image.url,
      objectKey: image.objectKey ?? '',
      storageProvider: image.storageProvider,
      contentType: image.contentType ?? 'image/jpeg',
      alt: image.alt ?? '',
      sortOrder: image.sortOrder
    });
    modals.openEditImage(product, image);
  };

  const submitProductForm = () => {
    const savedDraft = modals.selectedProduct;
    const productPayload = {
      name: productForm.values.name,
      description: productForm.values.description,
      status: productForm.values.status as AdminProductModel['status'],
      brand: productForm.values.brand || null,
      category: productForm.values.category || null,
      tags: csv(productForm.values.tags),
      flavor: productForm.values.flavor || null,
      occasion: productForm.values.occasion || null,
      ingredients: csv(productForm.values.ingredients),
      allergens: csv(productForm.values.allergens),
      nutritionFacts: keyValueLines(productForm.values.nutritionFacts),
      dietaryLabels: csv(productForm.values.dietaryLabels),
      isPerishable: productForm.values.isPerishable,
      storageInstructions: productForm.values.storageInstructions || null,
      shelfLifeNotes: productForm.values.shelfLifeNotes || null,
      bundleEligible: productForm.values.bundleEligible,
      seoTitle: productForm.values.seoTitle || null,
      seoDescription: productForm.values.seoDescription || null
    };

    if (modals.mode === 'create' && !savedDraft) {
      mutations.createMutation.mutate({
        name: productForm.values.name,
        status: productForm.values.status as AdminProductModel['status'],
        ...(productForm.values.brand ? { brand: productForm.values.brand } : {}),
        ...(productForm.values.category ? { category: productForm.values.category } : {}),
        ...(productForm.values.slug ? { slug: productForm.values.slug } : {}),
        ...(productForm.values.description
          ? { description: productForm.values.description }
          : {}),
        tags: csv(productForm.values.tags),
        ...(productForm.values.flavor ? { flavor: productForm.values.flavor } : {}),
        ...(productForm.values.occasion ? { occasion: productForm.values.occasion } : {}),
        ingredients: csv(productForm.values.ingredients),
        allergens: csv(productForm.values.allergens),
        nutritionFacts: keyValueLines(productForm.values.nutritionFacts),
        dietaryLabels: csv(productForm.values.dietaryLabels),
        isPerishable: productForm.values.isPerishable,
        ...(productForm.values.storageInstructions ? { storageInstructions: productForm.values.storageInstructions } : {}),
        ...(productForm.values.shelfLifeNotes ? { shelfLifeNotes: productForm.values.shelfLifeNotes } : {}),
        bundleEligible: productForm.values.bundleEligible,
        ...(productForm.values.seoTitle ? { seoTitle: productForm.values.seoTitle } : {}),
        ...(productForm.values.seoDescription ? { seoDescription: productForm.values.seoDescription } : {})
      });
      return;
    }

    if (savedDraft) {
      mutations.updateMutation.mutate({
        productId: savedDraft.id,
        product: productPayload
      });
    }
  };

  const uploadWizardProductImages = async (files: File[]) => {
    const product = modals.selectedProduct;
    if (!product || files.length === 0) {
      return;
    }

    try {
      for (const [index, file] of files.entries()) {
        const upload = await mutations.imageUploadMutation.mutateAsync({
          productId: product.id,
          contentType: file.type
        });
        const uploaded = await uploadProductImageFile(file, upload);
        await mutations.imageCreateMutation.mutateAsync({
          productId: product.id,
          image: {
            url: uploaded.url,
            objectKey: uploaded.objectKey,
            storageProvider: upload.provider,
            contentType: file.type as 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp',
            alt: `${product.name} image ${product.images.length + wizardUploadedImageCount + index + 1}`,
            sortOrder: product.images.length + wizardUploadedImageCount + index
          }
        });
      }
      setWizardUploadedImageCount((current) => current + files.length);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Upload failed',
        message: 'One or more product images could not be uploaded.'
      });
    }
  };

  const addSku = () => {
    if (!selectedFreshProduct) {
      return;
    }

    mutations.skuMutation.mutate({
      productId: selectedFreshProduct.id,
      sku: {
        name: skuForm.values.name,
        priceCents: Math.round(skuForm.values.priceCents * 100),
        currency: 'USD',
        active: skuForm.values.active,
        ...(skuForm.values.size ? { size: skuForm.values.size } : {}),
        ...(skuForm.values.packCount ? { packCount: skuForm.values.packCount } : {}),
        ...(skuForm.values.unitLabel ? { unitLabel: skuForm.values.unitLabel } : {}),
        ...(skuForm.values.barcode ? { barcode: skuForm.values.barcode } : {}),
        ...(skuForm.values.weight ? { weight: skuForm.values.weight } : {}),
        ...(skuForm.values.dimensions ? { dimensions: skuForm.values.dimensions } : {}),
        perishableOverride: skuForm.values.perishableOverride
      }
    });
  };

  const saveSnackDetails = () => {
    if (!selectedFreshProduct) {
      return;
    }
    mutations.updateMutation.mutate({
      productId: selectedFreshProduct.id,
      product: {
        tags: csv(productForm.values.tags),
        flavor: productForm.values.flavor || null,
        occasion: productForm.values.occasion || null,
        ingredients: csv(productForm.values.ingredients),
        allergens: csv(productForm.values.allergens),
        nutritionFacts: keyValueLines(productForm.values.nutritionFacts),
        dietaryLabels: csv(productForm.values.dietaryLabels),
        isPerishable: productForm.values.isPerishable,
        storageInstructions: productForm.values.storageInstructions || null,
        shelfLifeNotes: productForm.values.shelfLifeNotes || null,
        bundleEligible: productForm.values.bundleEligible
      }
    });
  };

  const saveSeo = () => {
    if (!selectedFreshProduct) {
      return;
    }
    mutations.updateMutation.mutate({
      productId: selectedFreshProduct.id,
      product: {
        seoTitle: productForm.values.seoTitle || null,
        seoDescription: productForm.values.seoDescription || null
      }
    });
  };

  const activeCount = products.filter((product) => product.status === 'active').length;
  const draftCount = products.filter((product) => product.status === 'draft').length;
  const skuCount = products.reduce((total, product) => total + product.skuCount, 0);
  const lowStockCount = products.reduce((total, product) => total + product.lowStockSkuCount, 0);

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AdminProductHeader
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreate={openCreate}
        />

        <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics admin-product-metrics">
          <MetricCard label="Menu Items" value={filteredProducts.length} hint={`Of ${products.length} total`} tone="green" />
          <MetricCard label="Live" value={activeCount} hint="On menu" tone="blue" />
          <MetricCard label="Low Stock" value={lowStockCount} hint="Restock soon" tone="orange" />
          <MetricCard label="Price Options" value={skuCount} hint={`${draftCount} drafts`} tone="gray" />
        </SimpleGrid>

        {productsQuery.isLoading ? (
          <AdminProductLoadingState />
        ) : products.length === 0 ? (
          <AdminProductEmptyState />
        ) : (
          <>
            <div className="admin-product-mobile-list">
              <div className="admin-mobile-filter-row">
                {[
                  { label: 'All Items', value: 'all', count: products.length },
                  { label: 'Live', value: 'active', count: activeCount },
                  { label: 'Low Stock', value: 'low-stock', count: lowStockCount }
                ].map((item) => (
                  <Button
                    key={item.value}
                    size="xs"
                    className={`admin-mobile-filter-chip ${
                      (item.value === 'all' && statusFilter === 'all' && categoryFilter === 'all') ||
                      (item.value === statusFilter) ||
                      (item.value === 'low-stock' && categoryFilter === '__low_stock')
                        ? 'admin-mobile-filter-chip-active'
                        : ''
                    }`}
                    onClick={() => {
                      if (item.value === 'low-stock') {
                        setStatusFilter('all');
                        setCategoryFilter('__low_stock');
                        return;
                      }
                      setCategoryFilter('all');
                      setStatusFilter(item.value);
                    }}
                  >
                    {item.label}<span>{item.count}</span>
                  </Button>
                ))}
              </div>
              {filteredProducts.map((product) => (
                <AdminProductMobileCard
                  key={product.id}
                  product={product}
                  onDetails={openDetails}
                  onEdit={openEdit}
                  onArchive={modals.openArchive}
                  onRestore={modals.openRestore}
                />
              ))}
            </div>

            <div className="admin-product-desktop-workspace">
              <div style={{ minWidth: 0 }}>
                {viewMode === 'grid' ? (
                  <AdminProductGrid
                    products={filteredProducts}
                    onDetails={openDetails}
                    onEdit={openEdit}
                    onArchive={modals.openArchive}
                    onRestore={modals.openRestore}
                  />
                ) : (
                  <AdminProductTable
                    products={filteredProducts}
                    selectedProductId={selectedListProduct?.id ?? null}
                    onSelect={(product) => setSelectedListProductId(product.id)}
                    onDetails={openDetails}
                    onEdit={openEdit}
                    onArchive={modals.openArchive}
                    onRestore={modals.openRestore}
                  />
                )}
              </div>
              <ProductQuickPanel
                product={selectedListProduct}
                onEdit={openEdit}
                onDetails={openDetails}
              />
            </div>
          </>
        )}
      </Stack>

      <AdminProductFormModal
        mode={modals.mode}
        opened={modals.mode === 'create' || modals.mode === 'edit'}
        loading={mutations.createMutation.isPending || mutations.updateMutation.isPending}
        uploadLoading={mutations.imageUploadMutation.isPending || mutations.imageCreateMutation.isPending}
        createdProduct={modals.mode === 'create' ? modals.selectedProduct : null}
        uploadedImageCount={wizardUploadedImageCount}
        form={productForm}
        onClose={resetAndClose}
        onSubmit={submitProductForm}
        onUploadFiles={uploadWizardProductImages}
      />

      <AdminProductDetailsModal
        opened={modals.mode === 'details'}
        product={selectedFreshProduct}
        skuForm={skuForm}
        skuLoading={mutations.skuMutation.isPending}
        productForm={productForm}
        productLoading={mutations.updateMutation.isPending}
        onClose={resetAndClose}
        onAddSku={addSku}
        onSaveSnackDetails={saveSnackDetails}
        onSaveSeo={saveSeo}
        onCreateImage={openCreateImage}
        onEditImage={openEditImage}
        onRemoveImage={modals.openRemoveImage}
      />

      <AdminProductImageModal
        mode={modals.mode === 'image-edit' ? 'edit' : 'create'}
        opened={modals.mode === 'image-create' || modals.mode === 'image-edit'}
        image={modals.selectedImage}
        form={imageForm}
        loading={mutations.imageCreateMutation.isPending || mutations.imageUpdateMutation.isPending}
        uploadLoading={mutations.imageUploadMutation.isPending}
        onClose={resetAndClose}
        onUploadFile={(file) => {
          if (modals.selectedProduct) {
            mutations.imageUploadMutation.mutate(
              {
                productId: modals.selectedProduct.id,
                contentType: file.type
              },
              {
                onSuccess: (upload) => {
                  void uploadProductImageFile(file, upload)
                    .then((uploaded) => {
                      imageForm.setValues({
                        ...imageForm.values,
                        url: uploaded.url,
                        objectKey: uploaded.objectKey,
                        storageProvider: upload.provider,
                        contentType: file.type
                      });
                      notifications.show({
                        color: 'green',
                        title: 'Image uploaded',
                        message: 'Review the alt text, then save the image.'
                      });
                    })
                    .catch(() => {
                      notifications.show({
                        color: 'red',
                        title: 'Upload failed',
                        message: 'The image could not be uploaded. Try another file.'
                      });
                    });
                }
              },
            );
          }
        }}
        onSubmit={() => {
          if (!modals.selectedProduct) {
            return;
          }
          if (modals.mode === 'image-edit' && modals.selectedImage) {
            mutations.imageUpdateMutation.mutate({
              productId: modals.selectedProduct.id,
              imageId: modals.selectedImage.id,
              image: {
                alt: imageForm.values.alt || null,
                sortOrder: imageForm.values.sortOrder
              }
            });
            resetAndClose();
            return;
          }
          mutations.imageCreateMutation.mutate({
            productId: modals.selectedProduct.id,
            image: {
              url: imageForm.values.url,
              ...(imageForm.values.objectKey ? { objectKey: imageForm.values.objectKey } : {}),
              storageProvider: imageForm.values.storageProvider as 'cloudinary' | 'r2',
              contentType: imageForm.values.contentType as 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp',
              ...(imageForm.values.alt ? { alt: imageForm.values.alt } : {}),
              sortOrder: imageForm.values.sortOrder
            }
          });
          resetAndClose();
        }}
      />

      <AdminProductConfirmModal
        opened={modals.mode === 'archive' || modals.mode === 'restore'}
        title={modals.mode === 'archive' ? 'Archive Product' : 'Restore Product'}
        body={
          modals.mode === 'archive'
            ? 'This product will no longer be sellable. You can restore it later.'
            : 'This product will return to draft status.'
        }
        confirmLabel={modals.mode === 'archive' ? 'Archive' : 'Restore'}
        loading={mutations.archiveMutation.isPending || mutations.restoreMutation.isPending}
        onClose={resetAndClose}
        onConfirm={() => {
          if (!modals.selectedProduct) {
            return;
          }

          if (modals.mode === 'archive') {
            mutations.archiveMutation.mutate(modals.selectedProduct);
          } else {
            mutations.restoreMutation.mutate(modals.selectedProduct);
          }
        }}
      />

      <AdminProductConfirmModal
        opened={modals.mode === 'image-remove'}
        title="Remove Image"
        body={`Remove ${modals.selectedImage?.alt ?? 'this image'} from the product?`}
        confirmLabel="Remove"
        loading={mutations.imageRemoveMutation.isPending}
        onClose={resetAndClose}
        onConfirm={() => {
          if (modals.selectedProduct && modals.selectedImage) {
            mutations.imageRemoveMutation.mutate({
              productId: modals.selectedProduct.id,
              imageId: modals.selectedImage.id
            });
            resetAndClose();
          }
        }}
      />
    </div>
  );
}

function ProductQuickPanel({
  product,
  onEdit,
  onDetails
}: {
  product: AdminProductModel | null;
  onEdit: (product: AdminProductModel) => void;
  onDetails: (product: AdminProductModel) => void;
}) {
  if (!product) {
    return (
      <Paper withBorder className="enterprise-panel admin-product-quick-panel">
        <Text fw={900}>Selected Item</Text>
        <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Choose a product to see quick actions.</Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder className="enterprise-panel admin-product-quick-panel">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="xs" fw={900} tt="uppercase" style={{ color: '#ffd98a' }}>Selected Item</Text>
          <Text fw={950} className="tt-editorial" style={{ color: 'var(--tt-cream)', fontSize: '1.3rem', lineHeight: 1.1 }}>
            {product.name}
          </Text>
        </div>
        <Badge color={product.stockStatus === 'low_stock' || product.stockStatus === 'out_of_stock' ? 'red' : 'green'} variant="light">
          {product.stockStatusLabel}
        </Badge>
      </Group>

      <div className="admin-product-quick-image">
        {product.primaryImageUrl ? <img src={product.primaryImageUrl} alt={product.name} /> : <span>Add Image</span>}
      </div>

      <div className="admin-product-quick-sku-list">
        {product.skus.slice(0, 3).map((sku) => (
          <div key={sku.id}>
            <div>
              <Text fw={850}>{sku.name}</Text>
              <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>{sku.stockStatusLabel} • {sku.available} available</Text>
            </div>
            <Text fw={900} style={{ color: '#ffd98a' }}>{formatUsd(sku.priceCents)}</Text>
          </div>
        ))}
        {product.skus.length === 0 ? (
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Add a price option to start selling this item.</Text>
        ) : null}
      </div>

      <Group grow>
        <Button className="admin-mobile-secondary-button" onClick={() => onDetails(product)}>
          Manage Stock
        </Button>
        <Button onClick={() => onEdit(product)}>
          Edit
        </Button>
      </Group>
    </Paper>
  );
}

function fillProductFormFromModel(product: AdminProductModel) {
  const metadata = product.metadata ?? {};
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    status: product.status,
    brand: product.brand ?? '',
    category: product.category ?? '',
    tags: csvText(metadata.tags),
    flavor: text(metadata.flavor),
    occasion: text(metadata.occasion),
    ingredients: csvText(metadata.ingredients),
    allergens: csvText(metadata.allergens),
    nutritionFacts: keyValueText(metadata.nutritionFacts),
    dietaryLabels: csvText(metadata.dietaryLabels),
    isPerishable: metadata.isPerishable === true,
    storageInstructions: text(metadata.storageInstructions),
    shelfLifeNotes: text(metadata.shelfLifeNotes),
    bundleEligible: metadata.bundleEligible === true,
    seoTitle: text(metadata.seoTitle),
    seoDescription: text(metadata.seoDescription)
  };
}

function csv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function csvText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string').join(', ') : '';
}

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function keyValueText(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }
  return Object.entries(value)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join('\n');
}

function keyValueLines(value: string): Record<string, string> {
  const entries: Array<[string, string]> = [];
  for (const line of value.split('\n')) {
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey?.trim();
    const item = rest.join(':').trim();
    if (key && item) {
      entries.push([key, item]);
    }
  }
  return Object.fromEntries(entries);
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
}

async function uploadProductImageFile(
  file: File,
  upload: {
    provider: 'cloudinary' | 'r2';
    uploadUrl: string;
    fields: Record<string, string | number>;
    objectKey: string;
    publicUrl?: string;
  },
) {
  if (upload.provider === 'cloudinary') {
    const formData = new FormData();
    for (const [key, value] of Object.entries(upload.fields)) {
      formData.append(key, String(value));
    }
    formData.append('file', file);
    const response = await fetch(upload.uploadUrl, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error('Cloudinary upload failed.');
    }
    const body = (await response.json()) as { secure_url?: string; url?: string };
    const url = body.secure_url ?? body.url;
    if (!url) {
      throw new Error('Cloudinary did not return an image URL.');
    }
    return {
      url,
      objectKey: upload.objectKey
    };
  }

  const response = await fetch(upload.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'content-type': file.type
    }
  });
  if (!response.ok || !upload.publicUrl) {
    throw new Error('R2 upload failed.');
  }
  return {
    url: upload.publicUrl,
    objectKey: upload.objectKey
  };
}
