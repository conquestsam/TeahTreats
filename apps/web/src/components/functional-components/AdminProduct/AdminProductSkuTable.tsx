import { Paper, Table, Text } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { AdminProductModel } from '@/types/AdminProduct/adminProductTypes';

export function AdminProductSkuTable({ product }: Readonly<{ product: AdminProductModel }>) {
  if (product.skus.length === 0) {
    return (
      <Paper withBorder p="md" className="enterprise-panel">
        <Text>No SKUs yet.</Text>
      </Paper>
    );
  }

  return (
    <Table.ScrollContainer minWidth={420}>
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
              <Table.Td>{sku.active ? 'Active' : 'Inactive'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
