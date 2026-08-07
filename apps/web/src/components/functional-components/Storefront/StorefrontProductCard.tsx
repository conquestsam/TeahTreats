'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import type { StorefrontProductCard as ProductCardModel } from '@/types/Storefront/storefrontTypes';
import { StorefrontAvailabilityBadge } from './StorefrontAvailabilityBadge';

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) {
    return 'Not priced';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function StorefrontProductCard({ product }: Readonly<{ product: ProductCardModel }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/products/${product.slug}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      >
        <div className="tt-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Image */}
          <div className="tt-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
            {product.image ? (
              <img
                src={product.image.url}
                alt={product.image.alt ?? product.name}
                style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div className="tt-image-placeholder" style={{ height: 210 }}>
                <span style={{
                  fontFamily: 'var(--tt-font-editorial)', fontSize: '1.3rem',
                  color: 'var(--tt-gold-muted)', position: 'relative', zIndex: 1
                }}>
                  T
                </span>
              </div>
            )}
            <div style={{ position: 'absolute', left: 12, top: 12 }}>
              <StorefrontAvailabilityBadge availability={product.availability} />
            </div>
            {product.isPerishable && (
              <div style={{ position: 'absolute', right: 12, top: 12 }}>
                <span className="tt-badge-fresh" style={{
                  padding: '3px 10px', borderRadius: 20, display: 'inline-block'
                }}>
                  Fresh
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="tt-card-inner" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {product.category && (
              <span className="tt-badge-gold" style={{
                padding: '2px 10px', borderRadius: 20, display: 'inline-block',
                width: 'fit-content', fontSize: '0.65rem'
              }}>
                {product.category}
              </span>
            )}

            <h3 style={{
              fontFamily: 'var(--tt-font-editorial)', fontWeight: 600,
              fontSize: '1.05rem', lineHeight: 1.25, color: 'var(--tt-cream)',
              margin: 0, display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const, overflow: 'hidden'
            }}>
              {product.name}
            </h3>

            <p style={{
              fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--tt-cream-muted)',
              margin: 0, display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const, overflow: 'hidden'
            }}>
              {product.description ?? 'Fresh snack ready to order.'}
            </p>

            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--tt-font-editorial)', fontWeight: 700,
                  fontSize: '1.15rem', color: 'var(--tt-gold-light)'
                }}>
                  {formatMoney(product.startingPriceCents, product.currency)}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--tt-cream-dim)' }}>
                  {product.availableQuantity > 0 ? `${product.availableQuantity} left` : 'Sold out'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
