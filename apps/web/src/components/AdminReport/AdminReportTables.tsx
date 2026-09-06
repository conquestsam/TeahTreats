import { Badge, Paper, Table, Text } from '@mantine/core';
import type {
  AdminStockReportItemModel,
  AdminTopProductModel
} from '@/types/AdminReport/adminReportTypes';

export function AdminTopProductsTable({ products }: { products: AdminTopProductModel[] }) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={680}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Sold</Table.Th>
              <Table.Th>Revenue</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" size="sm">No product sales yet.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              products.map((product) => (
                <Table.Tr key={`${product.productName}-${product.skuName}`}>
                  <Table.Td>
                    <Text fw={700}>{product.productName}</Text>
                  </Table.Td>
                  <Table.Td>{product.skuName}</Table.Td>
                  <Table.Td>{product.quantitySold}</Table.Td>
                  <Table.Td>{formatMoney(product.revenueCents)}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

export function AdminStockTable({
  title,
  rows,
  tone
}: {
  title: string;
  rows: AdminStockReportItemModel[];
  tone: 'orange' | 'red';
}) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <div className="border-b border-stone-200 p-4">
        <Text fw={900}>{title}</Text>
      </div>
      <Table.ScrollContainer minWidth={680}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Available</Table.Th>
              <Table.Th>Expiry</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" size="sm">No matching stock found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((row) => (
                <Table.Tr key={row.batchId}>
                  <Table.Td>
                    <Text fw={700}>{row.productName}</Text>
                  </Table.Td>
                  <Table.Td>{row.skuName}</Table.Td>
                  <Table.Td>
                    <Badge color={tone} variant="light">
                      {row.available}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : 'No expiry'}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

export function formatMoney(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(cents / 100);
}
