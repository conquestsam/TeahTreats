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
      <ActionIcon aria-label="View product" variant="light" onClick={() => onDetails(product)}>
        i
      </ActionIcon>
      <ActionIcon aria-label="Edit product" variant="light" onClick={() => onEdit(product)}>
        E
      </ActionIcon>
      {product.status === 'archived' ? (
        <ActionIcon
          aria-label="Restore product"
          variant="light"
          color="green"
          onClick={() => onRestore(product)}
        >
          R
        </ActionIcon>
      ) : (
        <ActionIcon
          aria-label="Archive product"
          variant="light"
          color="red"
          onClick={() => onArchive(product)}
        >
          A
        </ActionIcon>
      )}
    </Group>
  );
}
