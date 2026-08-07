'use client';

import { Select, TextInput } from '@mantine/core';
import { useState } from 'react';
import { storefrontSortOptions } from '@/constants/Storefront/storefrontConstants';
import type { StorefrontProductQuery, StorefrontSortOption } from '@/types/Storefront/storefrontTypes';

export function StorefrontFilters({
  initialQuery,
  categories,
  onApply
}: Readonly<{
  initialQuery: StorefrontProductQuery;
  categories: Array<{ value: string; label: string }>;
  onApply: (query: StorefrontProductQuery) => void;
}>) {
  const [q, setQ] = useState(initialQuery.q ?? '');
  const [category, setCategory] = useState(initialQuery.category ?? '');
  const [sort, setSort] = useState<StorefrontSortOption>(initialQuery.sort ?? 'newest');

  const inputStyles = {
    input: {
      background: 'var(--tt-surface)',
      border: '1px solid rgba(184, 147, 62, 0.15)',
      color: 'var(--tt-cream)',
      '&::placeholder': { color: 'var(--tt-cream-dim)' },
      '&:focus': {
        borderColor: 'var(--tt-gold)',
        boxShadow: '0 0 0 2px rgba(184, 147, 62, 0.12)'
      }
    },
    label: { color: 'var(--tt-cream-muted)', fontSize: '0.78rem', fontWeight: 600 }
  };

  return (
    <div className="tt-panel" style={{ padding: 20 }}>
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap'
      }}>
        <TextInput
          label="Search"
          placeholder="Search snacks"
          value={q}
          onChange={(event) => setQ(event.currentTarget.value)}
          styles={inputStyles}
          style={{ flex: '1 1 200px', minWidth: 160 }}
        />
        <Select
          label="Category"
          placeholder="All"
          data={categories}
          value={category || null}
          clearable
          onChange={(value) => setCategory(value ?? '')}
          styles={inputStyles}
          style={{ flex: '0 1 200px', minWidth: 140 }}
        />
        <Select
          label="Sort"
          data={storefrontSortOptions}
          value={sort}
          onChange={(value) => setSort((value as StorefrontSortOption | null) ?? 'newest')}
          styles={inputStyles}
          style={{ flex: '0 1 200px', minWidth: 140 }}
        />
        <button
          className="tt-btn-primary"
          onClick={() => onApply({ q: q.trim() || undefined, category: category || undefined, sort })}
          style={{
            padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.85rem', border: 'none'
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
