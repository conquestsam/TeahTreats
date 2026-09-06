import { ActionIcon, Group } from '@mantine/core';
import type {
  AdminProductActionHandlers,
  AdminProductModel
} from '@/types/AdminProduct/adminProductTypes';

export function AdminProductActions({
  product,
  onDetails,
  onEdit,
  onArchive,
  onRestore
}: Readonly<AdminProductActionHandlers & { product: AdminProductModel }>) {
  return (
    <Group gap="xs">
      <ActionIcon aria-label="View product details" variant="light" onClick={() => onDetails(product)}>
        ⋯
      </ActionIcon>
      <ActionIcon aria-label="Edit product" variant="light" onClick={() => onEdit(product)}>
        ✎
      </ActionIcon>
      {product.status === 'archived' ? (
        <ActionIcon
          aria-label="Restore product"
          variant="light"
          color="green"
          onClick={() => onRestore(product)}
        >
          ↻
        </ActionIcon>
      ) : (
        <ActionIcon
          aria-label="Archive product"
          variant="light"
          color="red"
          onClick={() => onArchive(product)}
        >
          ×
        </ActionIcon>
      )}
    </Group>
  );
}
