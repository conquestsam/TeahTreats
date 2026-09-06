'use client';

import { Badge, Button, Group, Progress, Stack, Text } from '@mantine/core';
import type { AdminPromotionModel } from '@/types/AdminPromotion/adminPromotionTypes';

interface AdminPromotionMobileCardProps {
  promotion: AdminPromotionModel;
  onEdit: (promotion: AdminPromotionModel) => void;
  onArchive: (promotion: AdminPromotionModel) => void;
}

export function AdminPromotionMobileCard({ promotion, onEdit, onArchive }: AdminPromotionMobileCardProps) {
  const coupon = promotion.couponCodes[0]?.code ?? 'No code';
  const usage = promotion.couponCodes[0]?.usageLimit ?? promotion.usageLimit ?? 0;
  const usagePercent = usage > 0 ? Math.min(96, Math.max(12, 100 / usage)) : 0;

  return (
    <article className="admin-mobile-order-card admin-promotion-mobile-card">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Text fw={850} size="xs" tt="uppercase" style={{ color: '#ffd98a' }}>{promotion.targetType.replaceAll('_', ' ')}</Text>
            <Text fw={950} className="admin-product-mobile-title">{promotion.name}</Text>
          </div>
          <Badge color={promotion.status === 'active' ? 'green' : 'gray'} variant="light">
            {promotion.status}
          </Badge>
        </Group>
        <Group grow className="admin-promotion-rule-grid">
          <div><Text size="xs" tt="uppercase">Discount</Text><Text fw={900}>{formatDiscount(promotion)}</Text></div>
          <div><Text size="xs" tt="uppercase">Min order</Text><Text fw={900}>{promotion.minimumOrderAmountCents ? formatUsd(promotion.minimumOrderAmountCents) : 'None'}</Text></div>
          <div><Text size="xs" tt="uppercase">Code</Text><Text fw={900}>{coupon}</Text></div>
        </Group>
        <Stack gap={5}>
          <Group justify="space-between">
            <Text size="xs" fw={850}>Consumption quota</Text>
            <Text size="xs" fw={850}>{usage > 0 ? `Limit ${usage}` : 'No limit'}</Text>
          </Group>
          <Progress value={usagePercent} color={promotion.status === 'active' ? 'yellow' : 'gray'} size="sm" />
        </Stack>
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => onEdit(promotion)}>
            Edit
          </Button>
          {promotion.status !== 'archived' ? (
            <Button size="xs" color="red" variant="subtle" onClick={() => onArchive(promotion)}>
              Archive
            </Button>
          ) : null}
        </Group>
      </Stack>
    </article>
  );
}

function formatDiscount(promotion: AdminPromotionModel) {
  if (promotion.discountType === 'percentage' || promotion.discountType === 'first_order') {
    return `${promotion.discountValue}%`;
  }
  if (promotion.discountType === 'free_shipping') {
    return 'Delivery';
  }
  return formatUsd(promotion.discountValue);
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
