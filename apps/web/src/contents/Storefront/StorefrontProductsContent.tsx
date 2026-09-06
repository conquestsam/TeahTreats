'use client';

import { Pagination } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { StorefrontFilters } from '@/components/Storefront/StorefrontFilters';
import { StorefrontProductGrid } from '@/components/Storefront/StorefrontProductGrid';
import { Badge } from '@/components/ui/badge';
import { useStorefrontCollectionsQuery, useStorefrontProductsQuery } from '@/hooks/Storefront/useStorefrontQuery';
import type { StorefrontProductQuery, StorefrontSortOption } from '@/types/Storefront/storefrontTypes';

function readQuery(searchParams: URLSearchParams): StorefrontProductQuery {
  return {
    page: Number(searchParams.get('page') ?? 1),
    pageSize: 12,
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    sort: (searchParams.get('sort') as StorefrontSortOption | null) ?? 'newest'
  };
}

export function StorefrontProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = readQuery(searchParams);
  const productsQuery = useStorefrontProductsQuery(query);
  const collectionsQuery = useStorefrontCollectionsQuery();
  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.total ?? 0) / (productsQuery.data?.pageSize ?? 12)));

  const applyQuery = (nextQuery: StorefrontProductQuery) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...nextQuery, page: 1 })) {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    }
    router.push(`/products?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-[#2e2930] bg-[#0b0b0d]">
        <div className="tt-container">
          <div className="py-8 md:py-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f0c66d]">Order Online</p>
                <h1 className="mt-2 text-4xl font-black text-[#fff7e8] md:text-6xl">TeshTreats Menu</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#bca6a7]">
                  Browse fresh pastries, catering platters, cakes, drinks, and handoff-ready selections.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{productsQuery.data?.total ?? 0} items</Badge>
                <Badge variant="dark">USD pricing</Badge>
                <Badge variant="green">Fresh availability</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <StorefrontFilters
            initialQuery={query}
            categories={(collectionsQuery.data ?? []).map((collection) => ({
              value: collection.label,
              label: collection.label
            }))}
            onApply={applyQuery}
          />

          <StorefrontProductGrid
            products={productsQuery.data?.items ?? []}
            loading={productsQuery.isLoading}
            error={productsQuery.error}
          />

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-lg border border-[#342d32] bg-[#1f1d23] p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-[#bca6a7]">
                Page {query.page ?? 1} of {totalPages}
              </span>
              <Pagination
                value={query.page ?? 1}
                total={totalPages}
                onChange={goToPage}
                color="dark"
                styles={{
                  control: {
                    background: 'var(--tt-surface)',
                    border: '1px solid rgba(184, 147, 62, 0.15)',
                    color: 'var(--tt-cream)'
                  }
                }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {['Fresh bites', 'Office snacks', 'Sweet treats', 'Party packs'].map((tag) => (
              <Badge key={tag} variant="dark">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
