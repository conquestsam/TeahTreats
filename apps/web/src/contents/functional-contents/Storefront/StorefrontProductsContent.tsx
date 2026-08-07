'use client';

import { Pagination } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { StorefrontFilters } from '@/components/functional-components/Storefront/StorefrontFilters';
import { StorefrontProductGrid } from '@/components/functional-components/Storefront/StorefrontProductGrid';
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
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <p className="tt-eyebrow" style={{ marginBottom: 10 }}>Snack Catalog</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: 10 }}>
            Browse our collection
          </h1>
          <p className="tt-body" style={{ maxWidth: 560 }}>
            Filter by category, sort by freshness, and discover snacks with real-time availability.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20 }}>
              {productsQuery.data?.total ?? 0} snacks
            </span>
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
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 16, borderRadius: 12,
              background: 'var(--tt-charcoal)',
              border: '1px solid rgba(184, 147, 62, 0.08)'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--tt-cream-dim)' }}>
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

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Fresh bites', 'Office snacks', 'Sweet treats', 'Party packs'].map((tag) => (
              <span key={tag} className="tt-badge-gold" style={{ padding: '4px 14px', borderRadius: 20 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
