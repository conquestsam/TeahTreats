'use client';

import { TextInput } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { StorefrontProductGrid } from '@/components/functional-components/Storefront/StorefrontProductGrid';
import { useStorefrontSearchQuery } from '@/hooks/Storefront/useStorefrontQuery';

export function StorefrontSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const searchQuery = useStorefrontSearchQuery({ q: initialQuery, page: 1, pageSize: 12 }, Boolean(initialQuery));

  const submit = () => {
    const trimmed = query.trim();
    router.push((trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/products') as never);
  };

  const inputStyles = {
    input: {
      background: 'var(--tt-surface)',
      border: '1px solid rgba(184, 147, 62, 0.15)',
      color: 'var(--tt-cream)',
      fontSize: '1rem',
      '&::placeholder': { color: 'var(--tt-cream-dim)' },
      '&:focus': {
        borderColor: 'var(--tt-gold)',
        boxShadow: '0 0 0 2px rgba(184, 147, 62, 0.12)'
      }
    },
    label: { color: 'var(--tt-cream-muted)', fontSize: '0.78rem', fontWeight: 600 }
  };

  return (
    <div>
      {/* Page header */}
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <p className="tt-eyebrow" style={{ marginBottom: 10 }}>Search</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: 10 }}>
            Find the snack you want
          </h1>
          <p className="tt-body" style={{ maxWidth: 520 }}>
            Search by name, brand, flavor, ingredient, dietary tag, or occasion.
          </p>
          {initialQuery && (
            <span className="tt-badge-gold" style={{ padding: '4px 14px', borderRadius: 20, marginTop: 12, display: 'inline-block' }}>
              Searching &ldquo;{initialQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Search bar */}
          <div className="tt-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <TextInput
                label="Search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submit();
                }}
                placeholder="Search by name, brand, flavor, or occasion"
                styles={inputStyles}
                style={{ flex: 1 }}
              />
              <button
                className="tt-btn-primary"
                onClick={submit}
                style={{
                  padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.85rem', border: 'none'
                }}
              >
                Search
              </button>
            </div>
          </div>

          <StorefrontProductGrid
            products={searchQuery.data?.items ?? []}
            loading={searchQuery.isLoading}
            error={searchQuery.error}
            emptyText={initialQuery ? 'No snacks found.' : 'Search for a snack.'}
          />
        </div>
      </div>
    </div>
  );
}
