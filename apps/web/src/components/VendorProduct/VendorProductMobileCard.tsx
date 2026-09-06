'use client';

import { Badge, Button, Group, Image, Stack, Text } from '@mantine/core';
import type { VendorProductRow } from '@/types/VendorProduct/vendorProductTypes';

interface VendorProductMobileCardProps {
  product: VendorProductRow;
  onView: (product: VendorProductRow) => void;
}

export function VendorProductMobileCard({ product, onView }: VendorProductMobileCardProps) {
  return (
    <Stack gap="sm" className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Group align="flex-start" wrap="nowrap">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} h={64} w={76} fit="cover" radius="md" />
        ) : (
          <div className="flex h-16 w-[76px] shrink-0 items-center justify-center rounded-md bg-orange-50 text-xs font-bold text-orange-700">
            No img
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Text fw={900} truncate>{product.name}</Text>
          <Text size="xs" c="dimmed" truncate>{product.category ?? 'No category'}</Text>
          <Badge mt={6} size="sm" color={product.status === 'active' ? 'green' : product.status === 'draft' ? 'gray' : 'red'} variant="light">
            {product.status}
          </Badge>
        </div>
      </Group>
      <Text size="sm" c="dimmed">
        {product.activeSkuCount} active SKU of {product.skuCount}
      </Text>
      <Button variant="light" onClick={() => onView(product)}>
        View Product
      </Button>
    </Stack>
  );
}
