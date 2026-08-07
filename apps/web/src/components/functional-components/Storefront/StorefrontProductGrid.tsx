'use client';

import type { StorefrontProductCard as ProductCardModel } from '@/types/Storefront/storefrontTypes';
import { StorefrontProductCard } from './StorefrontProductCard';

export function StorefrontProductGrid({
  products,
  loading,
  error,
  emptyText = 'No snacks found.'
}: Readonly<{
  products: ProductCardModel[];
  loading?: boolean;
  error?: unknown;
  emptyText?: string;
}>) {
  if (loading) {
    return (
      <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid var(--tt-gold-muted)',
          borderTopColor: 'var(--tt-gold)',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
          Loading snacks...
        </h3>
        <p className="tt-body" style={{ fontSize: '0.85rem' }}>
          Checking fresh availability and prices.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(155, 27, 48, 0.1)',
          border: '1px solid rgba(155, 27, 48, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '1.4rem'
        }}>!</div>
        <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
          Could not load snacks.
        </h3>
        <p className="tt-body" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
          The API may be offline. Try again after the server is running.
        </p>
        <a href="/products" className="tt-btn-secondary" style={{
          display: 'inline-flex', padding: '10px 22px', borderRadius: 8,
          textDecoration: 'none', fontSize: '0.85rem'
        }}>
          Browse Products
        </a>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(184, 147, 62, 0.08)',
          border: '1px solid var(--tt-gold-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontFamily: 'var(--tt-font-editorial)', fontSize: '1.4rem', color: 'var(--tt-gold)'
        }}>T</div>
        <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
          {emptyText}
        </h3>
        <p className="tt-body" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
          Try a different search, category, or check back after new snacks are added.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/products" className="tt-btn-primary" style={{
            display: 'inline-flex', padding: '10px 22px', borderRadius: 8,
            textDecoration: 'none', fontSize: '0.85rem'
          }}>
            Reset All Filters
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid', gap: 16,
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
    }}>
      {products.map((product) => (
        <StorefrontProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
