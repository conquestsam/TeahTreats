'use client';

import { SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { StateCard } from '@/components/ui/state-card';
import { MetricCard } from '@/components/ui/metric-card';
import { VendorProductDetailModal } from '@/components/functional-components/VendorProduct/VendorProductDetailModal';
import { VendorProductMobileCard } from '@/components/functional-components/VendorProduct/VendorProductMobileCard';
import { VendorProductTable } from '@/components/functional-components/VendorProduct/VendorProductTable';
import {
  useVendorProductDetailQuery,
  useVendorProductQuery
} from '@/hooks/VendorProduct/useVendorProductQuery';
import type { VendorProductRow } from '@/types/VendorProduct/vendorProductTypes';

export function VendorProductContent() {
  const [selectedProduct, setSelectedProduct] = useState<VendorProductRow | null>(null);
  const productsQuery = useVendorProductQuery();
  const detailQuery = useVendorProductDetailQuery(selectedProduct?.id ?? null);
  const products = productsQuery.data ?? [];

  return (
    <div className="admin-container pb-24 pt-6 md:pb-10 md:pt-8">
      <Stack gap="lg">
        <div>
          <Title order={1}>Vendor Products</Title>
          <Text c="dimmed">View products owned by your tenant.</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <MetricCard label="Products" value={products.length} hint="Tenant catalog" tone="green" />
          <MetricCard label="Active" value={products.filter((product) => product.status === 'active').length} hint="Visible products" tone="blue" />
          <MetricCard label="Draft" value={products.filter((product) => product.status === 'draft').length} hint="Not public yet" tone="gray" />
        </SimpleGrid>

        {productsQuery.isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Skeleton h={140} />
            <Skeleton h={140} />
          </SimpleGrid>
        ) : productsQuery.isError ? (
          <StateCard title="Products unavailable" description="Check your tenant access and try again." tone="warning" />
        ) : products.length === 0 ? (
          <StateCard title="No products yet" description="Products created for this tenant will appear here." />
        ) : (
          <>
            <div className="hidden md:block">
              <VendorProductTable products={products} onView={setSelectedProduct} />
            </div>
            <SimpleGrid cols={{ base: 1, sm: 2 }} className="md:hidden">
              {products.map((product) => (
                <VendorProductMobileCard key={product.id} product={product} onView={setSelectedProduct} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>

      <VendorProductDetailModal
        opened={Boolean(selectedProduct)}
        loading={detailQuery.isLoading}
        product={detailQuery.data}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
