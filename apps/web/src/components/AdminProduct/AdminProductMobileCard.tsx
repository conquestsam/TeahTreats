import { Button, Group, Image, Switch, Text } from '@mantine/core';
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
  const isLive = product.status === 'active';
  const hasLowStock = product.stockStatus === 'low_stock' || product.stockStatus === 'out_of_stock';

  return (
    <article className={`admin-mobile-order-card admin-product-mobile-card ${!isLive ? 'admin-product-mobile-card-muted' : ''}`}>
      <div className="admin-product-mobile-main">
        <div className="admin-product-mobile-image">
          {product.primaryImageUrl ? (
            <Image src={product.primaryImageUrl} alt={product.name} h="100%" w="100%" fit="cover" />
          ) : (
            <span>Add Image</span>
          )}
        </div>

        <div className="admin-product-mobile-copy">
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text size="xs" fw={900} tt="uppercase" style={{ color: '#ffd98a' }}>
              {product.category || 'Menu Item'}
            </Text>
            <AdminProductStatusBadge status={product.status} />
          </Group>
          <Text fw={950} className="admin-mobile-card-ref admin-product-mobile-title">
            {product.name}
          </Text>
          <Text fw={950} className="admin-mobile-card-total">
            {product.priceRangeLabel}
          </Text>
          <span className={`admin-mobile-pill ${hasLowStock ? 'admin-mobile-pill-alert' : ''}`}>
            {product.stockStatusLabel} • {product.totalAvailable} available
          </span>
        </div>
      </div>

      <div className="admin-product-mobile-actions">
        <Switch
          checked={isLive}
          readOnly
          label={isLive ? 'Live on Menu' : 'Hidden'}
          color="red"
          styles={{ label: { color: 'var(--tt-cream)', fontWeight: 800 } }}
        />
        <Button className="admin-mobile-secondary-button" onClick={() => onDetails(product)}>
          Manage Stock
        </Button>
        <Button variant="light" onClick={() => onEdit(product)}>
          Edit
        </Button>
        {product.status === 'archived' ? (
          <Button color="green" variant="light" onClick={() => onRestore(product)}>
            Restore
          </Button>
        ) : (
          <Button color="red" variant="subtle" onClick={() => onArchive(product)}>
            Archive
          </Button>
        )}
      </div>
    </article>
  );
}
