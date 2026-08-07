'use client';

import { Badge, Button, Group, Paper, Stack, Table, Text } from '@mantine/core';
import type { AdminPromotionModel } from '@/types/AdminPromotion/adminPromotionTypes';

interface AdminPromotionTableProps {
  promotions: AdminPromotionModel[];
  onEdit: (promotion: AdminPromotionModel) => void;
  onArchive: (promotion: AdminPromotionModel) => void;
}

export function AdminPromotionTable({ promotions, onEdit, onArchive }: AdminPromotionTableProps) {
  return (
    <Paper withBorder className="overflow-hidden">
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Discount</Table.Th>
            <Table.Th>Coupon</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {promotions.map((promotion) => (
            <Table.Tr key={promotion.id}>
              <Table.Td>
                <Stack gap={2}>
                  <Text fw={850}>{promotion.name}</Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {promotion.description ?? 'No description'}
                  </Text>
                </Stack>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatDiscount(promotion)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {promotion.couponCodes[0]?.code ?? 'No code'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge color={promotion.status === 'active' ? 'green' : promotion.status === 'archived' ? 'gray' : 'blue'} variant="light">
                  {promotion.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group justify="flex-end" gap="xs">
                  <Button size="xs" variant="light" onClick={() => onEdit(promotion)}>
                    Edit
                  </Button>
                  {promotion.status !== 'archived' ? (
                    <Button size="xs" color="red" variant="subtle" onClick={() => onArchive(promotion)}>
                      Archive
                    </Button>
                  ) : null}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

function formatDiscount(promotion: AdminPromotionModel) {
  if (promotion.discountType === 'percentage' || promotion.discountType === 'first_order') {
    return `${promotion.discountValue}% off`;
  }
  if (promotion.discountType === 'free_shipping') {
    return 'Free shipping placeholder';
  }
  return `$${(promotion.discountValue / 100).toFixed(2)} off`;
}
