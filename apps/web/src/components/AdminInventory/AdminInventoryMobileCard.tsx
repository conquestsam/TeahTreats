import { Button, Group, Image, Text } from '@mantine/core';
import type { AdminInventoryBatchModel } from '@/types/AdminInventory/adminInventoryTypes';
import { AdminInventoryStatusBadge } from './AdminInventoryStatusBadge';

interface AdminInventoryMobileCardProps {
  batch: AdminInventoryBatchModel;
  onDetails: (batch: AdminInventoryBatchModel) => void;
  onAdjust: (batch: AdminInventoryBatchModel) => void;
  onExpire: (batch: AdminInventoryBatchModel) => void;
}

export function AdminInventoryMobileCard({
  batch,
  onDetails,
  onAdjust,
  onExpire
}: AdminInventoryMobileCardProps) {
  return (
    <article className="admin-mobile-order-card admin-inventory-mobile-card">
      <div className="admin-inventory-mobile-main">
        <span className="admin-product-mobile-image">
          {batch.productImageUrl ? <Image src={batch.productImageUrl} alt={batch.productName} h="100%" w="100%" fit="cover" /> : <span>No image</span>}
        </span>
        <div>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text fw={950} className="admin-product-mobile-title">{batch.productName}</Text>
            <Text fw={950} className="admin-mobile-card-total">{batch.available}</Text>
          </Group>
          <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>{batch.skuName}</Text>
          <Text size="xs" style={{ color: '#ffd98a' }}>{batch.batchCode}</Text>
        </div>
      </div>
      <Group gap="xs">
        <AdminInventoryStatusBadge batch={batch} />
        <span className="admin-mobile-pill">{batch.expiryLabel}</span>
        {batch.qualityChecked ? <span className="admin-mobile-pill">Checked</span> : null}
      </Group>
      <div className="admin-mobile-payment-route">
        <div>
          <Text size="xs" fw={900} tt="uppercase">Storage</Text>
          <Text fw={850}>{[batch.storageLocation, batch.storageZone].filter(Boolean).join(' • ') || 'Not set'}</Text>
        </div>
        <div>
          <Text size="xs" fw={900} tt="uppercase">Reserved</Text>
          <Text fw={850}>{batch.reserved} {batch.unitLabel}</Text>
        </div>
      </div>
      <div className="admin-mobile-card-actions">
        <Button fullWidth onClick={() => onAdjust(batch)}>
          Stock Adjustment
        </Button>
        <Button fullWidth className="admin-mobile-secondary-button" onClick={() => onDetails(batch)}>
          History
        </Button>
      </div>
      {batch.status !== 'expired' ? (
        <Button color="red" variant="light" onClick={() => onExpire(batch)}>
          Quarantine & Discard
        </Button>
      ) : null}
    </article>
  );
}
