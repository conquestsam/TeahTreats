import { Card, Group, Stack, Text } from '@mantine/core';
import { AdminProductActions } from './AdminProductActions';
import { AdminProductStatusBadge } from './AdminProductStatusBadge';
import type {
  AdminProductActionHandlers,
  AdminProductModel
} from '@/types/AdminProduct/adminProductTypes';

export function AdminProductMobileCard({
  product,
  onDetails,
  onEdit,
  onArchive,
  onRestore
}: Readonly<AdminProductActionHandlers & { product: AdminProductModel }>) {
  return (
    <Card withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700}>{product.name}</Text>
          <AdminProductStatusBadge status={product.status} />
        </Group>
        <Text size="sm" c="dimmed">
          {product.skus.length} SKUs
        </Text>
        <AdminProductActions
          product={product}
          onDetails={onDetails}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      </Stack>
    </Card>
  );
}
