import { Button, Group, NumberInput, Paper, Select, SimpleGrid, Stack, Switch, Table, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { formatMoney } from '@/lib/formatters/money';
import type { AdminProductModel, AdminProductSkuModel, UpdateAdminProductSkuInput } from '@/types/AdminProduct/adminProductTypes';

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'EUR', label: 'EUR - Euro' }
];

export function AdminProductSkuTable({
  product,
  loading,
  onUpdateSku
}: Readonly<{
  product: AdminProductModel;
  loading?: boolean;
  onUpdateSku: (sku: AdminProductSkuModel, input: UpdateAdminProductSkuInput) => void;
}>) {
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    active: true,
    size: '',
    packCount: 1,
    unitLabel: '',
    barcode: '',
    weight: '',
    dimensions: '',
    perishableOverride: false
  });

  const startEdit = (sku: AdminProductSkuModel) => {
    const metadata = sku.metadata ?? {};
    setEditingSkuId(sku.id);
    setDraft({
      name: sku.name,
      price: sku.priceCents / 100,
      currency: sku.currency,
      active: sku.active,
      size: textMetadata(metadata.size),
      packCount: numberMetadata(metadata.packCount, 1),
      unitLabel: textMetadata(metadata.unitLabel),
      barcode: textMetadata(metadata.barcode),
      weight: textMetadata(metadata.weight),
      dimensions: textMetadata(metadata.dimensions),
      perishableOverride: Boolean(metadata.perishableOverride)
    });
  };

  const cancelEdit = () => {
    setEditingSkuId(null);
    setDraft({
      name: '',
      price: 0,
      currency: 'USD',
      active: true,
      size: '',
      packCount: 1,
      unitLabel: '',
      barcode: '',
      weight: '',
      dimensions: '',
      perishableOverride: false
    });
  };

  const saveEdit = (sku: AdminProductSkuModel) => {
    onUpdateSku(sku, {
      name: draft.name,
      priceCents: Math.round(draft.price * 100),
      currency: draft.currency,
      active: draft.active,
      size: draft.size || null,
      packCount: draft.packCount || null,
      unitLabel: draft.unitLabel || null,
      barcode: draft.barcode || null,
      weight: draft.weight || null,
      dimensions: draft.dimensions || null,
      perishableOverride: draft.perishableOverride
    });
    cancelEdit();
  };

  if (product.skus.length === 0) {
    return (
      <Paper withBorder p="md" className="enterprise-panel">
        <Text>No price options yet.</Text>
      </Paper>
    );
  }

  return (
    <Table.ScrollContainer minWidth={420}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Option</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Currency</Table.Th>
            <Table.Th>Stock</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {product.skus.map((sku) => {
            const isEditing = editingSkuId === sku.id;

            return (
              <Table.Tr key={sku.id}>
                <Table.Td>
                  {isEditing ? (
                    <Stack gap="xs">
                      <TextInput
                        aria-label="Option name"
                        value={draft.name}
                        onChange={(event) => setDraft((current) => ({ ...current, name: event.currentTarget.value }))}
                      />
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                          label="Size"
                          value={draft.size}
                          onChange={(event) => setDraft((current) => ({ ...current, size: event.currentTarget.value }))}
                        />
                        <TextInput
                          label="Unit label"
                          value={draft.unitLabel}
                          onChange={(event) => setDraft((current) => ({ ...current, unitLabel: event.currentTarget.value }))}
                        />
                        <TextInput
                          label="Barcode"
                          value={draft.barcode}
                          onChange={(event) => setDraft((current) => ({ ...current, barcode: event.currentTarget.value }))}
                        />
                        <TextInput
                          label="Weight"
                          value={draft.weight}
                          onChange={(event) => setDraft((current) => ({ ...current, weight: event.currentTarget.value }))}
                        />
                        <TextInput
                          label="Dimensions"
                          value={draft.dimensions}
                          onChange={(event) => setDraft((current) => ({ ...current, dimensions: event.currentTarget.value }))}
                        />
                        <NumberInput
                          label="Pack count"
                          min={1}
                          value={draft.packCount}
                          onChange={(value) => setDraft((current) => ({ ...current, packCount: Number(value) || 1 }))}
                        />
                      </SimpleGrid>
                      <Switch
                        label="Perishable"
                        checked={draft.perishableOverride}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, perishableOverride: event.currentTarget.checked }))
                        }
                      />
                    </Stack>
                  ) : (
                    sku.name
                  )}
                </Table.Td>
                <Table.Td>
                  {isEditing ? (
                    <NumberInput
                      aria-label="Selling price"
                      min={0.01}
                      decimalScale={2}
                      fixedDecimalScale
                      prefix={draft.currency === 'USD' ? '$' : ''}
                      value={draft.price}
                      onChange={(value) => setDraft((current) => ({ ...current, price: Number(value) || 0 }))}
                    />
                  ) : (
                    formatMoney(sku.priceCents, sku.currency)
                  )}
                </Table.Td>
                <Table.Td>
                  {isEditing ? (
                    <Select
                      aria-label="Currency"
                      data={currencyOptions}
                      value={draft.currency}
                      allowDeselect={false}
                      onChange={(value) => setDraft((current) => ({ ...current, currency: value ?? 'USD' }))}
                    />
                  ) : (
                    sku.currency
                  )}
                </Table.Td>
                <Table.Td>{sku.available} available</Table.Td>
                <Table.Td>
                  {isEditing ? (
                    <Switch
                      label={draft.active ? 'Available' : 'Hidden'}
                      checked={draft.active}
                      onChange={(event) => setDraft((current) => ({ ...current, active: event.currentTarget.checked }))}
                    />
                  ) : (
                    sku.active ? 'Available' : 'Hidden'
                  )}
                </Table.Td>
                <Table.Td>
                  {isEditing ? (
                    <Group gap="xs" wrap="nowrap">
                      <Button size="xs" loading={Boolean(loading)} onClick={() => saveEdit(sku)}>
                        Save
                      </Button>
                      <Button size="xs" variant="subtle" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </Group>
                  ) : (
                    <Button size="xs" variant="light" onClick={() => startEdit(sku)}>
                      Edit price
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function textMetadata(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function numberMetadata(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
