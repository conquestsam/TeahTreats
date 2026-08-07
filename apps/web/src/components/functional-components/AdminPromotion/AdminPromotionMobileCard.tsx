'use client';

import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminPromotionModel } from '@/types/AdminPromotion/adminPromotionTypes';

interface AdminPromotionMobileCardProps {
  promotion: AdminPromotionModel;
  onEdit: (promotion: AdminPromotionModel) => void;
  onArchive: (promotion: AdminPromotionModel) => void;
}

export function AdminPromotionMobileCard({ promotion, onEdit, onArchive }: AdminPromotionMobileCardProps) {
  return (
    <Paper withBorder p="md" className="enterprise-panel">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={850}>{promotion.name}</Text>
          <Badge color={promotion.status === 'active' ? 'green' : 'gray'} variant="light">
            {promotion.status}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {promotion.couponCodes[0]?.code ?? 'No coupon code'}
        </Text>
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
    </Paper>
  );
}
