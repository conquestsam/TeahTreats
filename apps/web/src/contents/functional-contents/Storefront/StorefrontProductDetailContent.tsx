'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { StorefrontAddToCartDrawer } from '@/components/functional-components/Storefront/StorefrontAddToCartDrawer';
import { StorefrontAvailabilityBadge } from '@/components/functional-components/Storefront/StorefrontAvailabilityBadge';
import { useStorefrontAddToCartForm } from '@/hooks/Storefront/useStorefrontForm';
import { useStorefrontAddToCartMutation } from '@/hooks/Storefront/useStorefrontMutations';
import { useStorefrontModals } from '@/hooks/Storefront/useStorefrontModals';
import { useStorefrontProductDetailQuery } from '@/hooks/Storefront/useStorefrontQuery';

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) {
    return 'Not priced';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function StorefrontProductDetailContent({ slug }: Readonly<{ slug: string }>) {
  const productQuery = useStorefrontProductDetailQuery(slug);
  const modals = useStorefrontModals();
  const form = useStorefrontAddToCartForm();
  const addMutation = useStorefrontAddToCartMutation(modals.closeAddToCart);
  const product = productQuery.data;

  useEffect(() => {
    if (!product || form.getValues().skuId) {
      return;
    }
    const firstSellableSku = product.skus.find((sku) => sku.availableQuantity > 0);
    if (firstSellableSku) {
      form.setFieldValue('skuId', firstSellableSku.id);
    }
  }, [form, product]);

  if (productQuery.isLoading) {
    return (
      <div className="tt-container" style={{ paddingBlock: '56px' }}>
        <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '2px solid var(--tt-gold-muted)', borderTopColor: 'var(--tt-gold)',
            animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }} />
          <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>Loading snack...</h3>
          <p className="tt-body" style={{ fontSize: '0.85rem' }}>Checking details, price, and availability.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="tt-container" style={{ paddingBlock: '56px' }}>
        <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
          <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
            This snack is not available right now.
          </h3>
          <p className="tt-body" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
            It may be archived, out of stock, or no longer visible in the storefront.
          </p>
          <Link href="/products" className="tt-btn-secondary" style={{
            display: 'inline-flex', padding: '10px 22px', borderRadius: 8,
            textDecoration: 'none', fontSize: '0.85rem'
          }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tt-container" style={{ paddingBlock: '40px 64px' }}>
      <div className="pd-grid" style={{
        display: 'grid', gap: 40, gridTemplateColumns: '1fr', alignItems: 'start'
      }}>
        {/* Image */}
        <div style={{ position: 'sticky', top: 100 }}>
          {product.images[0] ? (
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(184, 147, 62, 0.1)',
              boxShadow: 'var(--tt-shadow-elevated)'
            }}>
              <img
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                style={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div className="tt-image-placeholder" style={{
              minHeight: 400, borderRadius: 20,
              border: '1px solid rgba(184, 147, 62, 0.08)'
            }}>
              <span style={{
                fontFamily: 'var(--tt-font-editorial)', fontSize: '3rem',
                color: 'var(--tt-gold-muted)', position: 'relative', zIndex: 1
              }}>T</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="tt-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Meta */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {product.category && (
                <span style={{ fontSize: '0.82rem', color: 'var(--tt-cream-dim)' }}>{product.category}</span>
              )}
              <StorefrontAvailabilityBadge availability={product.availability} />
              {product.isPerishable && (
                <span className="tt-badge-fresh" style={{ padding: '3px 10px', borderRadius: 20 }}>Fresh</span>
              )}
            </div>

            {/* Name */}
            <h1 style={{
              fontFamily: 'var(--tt-font-editorial)', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1,
              color: 'var(--tt-cream)', margin: 0
            }}>
              {product.name}
            </h1>

            {/* Description */}
            <p className="tt-body" style={{ fontSize: '0.95rem' }}>
              {product.description ?? 'Fresh snack ready to order.'}
            </p>

            {/* Price */}
            <p style={{
              fontFamily: 'var(--tt-font-editorial)', fontWeight: 700,
              fontSize: '1.5rem', color: 'var(--tt-gold-light)', margin: 0
            }}>
              From {formatMoney(product.startingPriceCents, product.currency)}
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Available', value: String(product.availableQuantity) },
                { label: 'Options', value: String(product.skus.length) },
                { label: 'Checkout', value: 'Reserved' }
              ].map((stat) => (
                <div key={stat.label} style={{
                  padding: '14px', borderRadius: 12,
                  background: 'var(--tt-surface)',
                  border: '1px solid rgba(184, 147, 62, 0.08)'
                }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--tt-cream-dim)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: 0, marginBottom: 4 }}>
                    {stat.label}
                  </p>
                  <p style={{ fontWeight: 800, color: 'var(--tt-cream)', fontSize: '1rem', margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              className="tt-btn-primary"
              disabled={product.availableQuantity <= 0}
              onClick={() => {
                form.reset();
                const firstSellableSku = product.skus.find((sku) => sku.availableQuantity > 0);
                if (firstSellableSku) {
                  form.setFieldValue('skuId', firstSellableSku.id);
                }
                modals.openAddToCart(product);
              }}
              style={{
                padding: '14px 28px', borderRadius: 10, cursor: 'pointer',
                fontSize: '1rem', width: '100%',
                opacity: product.availableQuantity <= 0 ? 0.5 : 1
              }}
            >
              Add to Cart
            </button>

            {product.availableQuantity <= 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-dim)', textAlign: 'center' }}>
                This snack is not available right now.
              </p>
            )}
          </div>
        </div>
      </div>

      <StorefrontAddToCartDrawer
        opened={modals.addToCartOpened}
        product={modals.selectedProduct}
        form={form}
        loading={addMutation.isPending}
        onClose={modals.closeAddToCart}
        onSubmit={() => addMutation.mutate(form.getValues())}
      />

      <style>{`
        @media (min-width: 768px) {
          .pd-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
