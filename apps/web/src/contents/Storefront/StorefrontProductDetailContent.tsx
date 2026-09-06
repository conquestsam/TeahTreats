'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { StorefrontAddToCartDrawer } from '@/components/Storefront/StorefrontAddToCartDrawer';
import { StorefrontAvailabilityBadge } from '@/components/Storefront/StorefrontAvailabilityBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="tt-container py-8 md:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/products" className="font-bold text-[#f0c66d] no-underline">Menu</Link>
        <span className="text-[#8f7b7d]">/</span>
        <span className="text-[#bca6a7]">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)] lg:items-start">
        <div className="lg:sticky lg:top-24">
          {product.images[0] ? (
            <div className="overflow-hidden rounded-lg border border-[#342d32] bg-[#151319] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
              <img
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                className="max-h-[560px] w-full object-cover"
              />
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-lg border border-[#342d32] bg-[#151319]">
              <span className="text-5xl font-black text-[#f0c66d]">T</span>
            </div>
          )}
        </div>

        <Card className="border-[#342d32] bg-[#1f1d23]">
          <CardContent className="space-y-5 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge variant="default">{product.category}</Badge>
              )}
              <StorefrontAvailabilityBadge availability={product.availability} />
              {product.isPerishable && (
                <Badge variant="green">Fresh</Badge>
              )}
            </div>

            <h1 className="text-4xl font-black leading-tight text-[#fff7e8] md:text-5xl">
              {product.name}
            </h1>

            <p className="text-sm leading-6 text-[#bca6a7]">
              {product.description ?? 'Fresh snack ready to order.'}
            </p>

            <p className="text-3xl font-black text-[#ffd98a]">
              From {formatMoney(product.startingPriceCents, product.currency)}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Available', value: String(product.availableQuantity) },
                { label: 'Options', value: String(product.skus.length) },
                { label: 'Handoff', value: product.isPerishable ? 'Fresh' : 'Ready' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-[#342d32] bg-[#151319] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8f7b7d]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-sm font-black text-[#fff7e8]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-lg bg-[#151319] p-3">
              {product.skus.map((sku) => (
                <div key={sku.id} className="flex items-center justify-between gap-3 border-b border-[#2c2730] py-2 last:border-b-0">
                  <div>
                    <p className="text-sm font-black text-[#fff7e8]">{sku.name}</p>
                    <p className="text-xs text-[#bca6a7]">{sku.availableQuantity > 0 ? `${sku.availableQuantity} available` : 'Sold out'}</p>
                  </div>
                  <p className="text-sm font-black text-[#ffd98a]">{formatMoney(sku.priceCents, sku.currency)}</p>
                </div>
              ))}
            </div>

            <Button
              disabled={product.availableQuantity <= 0}
              onClick={() => {
                form.reset();
                const firstSellableSku = product.skus.find((sku) => sku.availableQuantity > 0);
                if (firstSellableSku) {
                  form.setFieldValue('skuId', firstSellableSku.id);
                }
                modals.openAddToCart(product);
              }}
              className="w-full"
            >
              Add to Cart
            </Button>

            {product.availableQuantity <= 0 && (
              <p className="text-center text-sm text-[#bca6a7]">
                This snack is not available right now.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <StorefrontAddToCartDrawer
        opened={modals.addToCartOpened}
        product={modals.selectedProduct}
        form={form}
        loading={addMutation.isPending}
        onClose={modals.closeAddToCart}
        onSubmit={() => addMutation.mutate(form.getValues())}
      />
    </div>
  );
}
