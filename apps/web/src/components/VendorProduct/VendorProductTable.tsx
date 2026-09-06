'use client';

import { Badge, Button, Group, Image, Paper, Table, Text } from '@mantine/core';
import type { VendorProductRow } from '@/types/VendorProduct/vendorProductTypes';

interface VendorProductTableProps {
  products: VendorProductRow[];
  onView: (product: VendorProductRow) => void;
}

export function VendorProductTable({ products, onView }: VendorProductTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>SKUs</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((product) => (
              <Table.Tr key={product.id}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} h={44} w={54} fit="cover" radius="md" />
                    ) : (
                      <div className="flex h-11 w-[54px] shrink-0 items-center justify-center rounded-md bg-orange-50 text-xs font-bold text-orange-700">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <Text fw={800} truncate>{product.name}</Text>
                      <Text size="sm" c="dimmed" truncate>{product.slug}</Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge color={product.status === 'active' ? 'green' : product.status === 'draft' ? 'gray' : 'red'} variant="light">
                    {product.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{product.category ?? 'Not set'}</Table.Td>
                <Table.Td>{product.activeSkuCount}/{product.skuCount}</Table.Td>
                <Table.Td>{new Date(product.updatedAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Button size="xs" variant="light" onClick={() => onView(product)}>
                    View Product
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
