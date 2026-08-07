'use client';

import { Badge, Group, Image, Loader, Modal, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { VendorProductDetail } from '@/types/VendorProduct/vendorProductTypes';

interface VendorProductDetailModalProps {
  opened: boolean;
  loading?: boolean;
  product: VendorProductDetail | undefined;
  onClose: () => void;
}

export function VendorProductDetailModal({
  opened,
  loading,
  product,
  onClose
}: VendorProductDetailModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Product Detail" size="xl" centered>
      {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : product ? (
        <Stack gap="lg">
          <Group align="flex-start" justify="space-between">
            <div>
              <Text fw={900} size="lg">{product.name}</Text>
              <Text c="dimmed" size="sm">{product.slug}</Text>
            </div>
            <Badge color={product.status === 'active' ? 'green' : product.status === 'draft' ? 'gray' : 'red'} variant="light">
              {product.status}
            </Badge>
          </Group>

          {product.images.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              {product.images.slice(0, 3).map((image) => (
                <Image key={image.id} src={image.url} alt={image.alt ?? product.name} h={130} fit="cover" radius="md" />
              ))}
            </SimpleGrid>
          ) : null}

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Info label="Brand" value={product.brand ?? 'Not set'} />
            <Info label="Category" value={product.category ?? 'Not set'} />
          </SimpleGrid>
          <Info label="Description" value={product.description ?? 'No description yet.'} />

          <Stack gap="xs">
            <Text fw={900}>SKUs</Text>
            <Table.ScrollContainer minWidth={520}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {product.skus.map((sku) => (
                    <Table.Tr key={sku.id}>
                      <Table.Td>{sku.name}</Table.Td>
                      <Table.Td>{formatMoney(sku.priceCents, sku.currency)}</Table.Td>
                      <Table.Td>
                        <Badge color={sku.active ? 'green' : 'gray'} variant="light">
                          {sku.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
        </Stack>
      ) : (
        <Text c="dimmed">Select a product to view details.</Text>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={700}>{value}</Text>
    </div>
  );
}
