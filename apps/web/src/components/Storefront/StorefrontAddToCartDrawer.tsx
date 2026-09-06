'use client';

import { Drawer, NumberInput, Radio } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { StorefrontAddToCartInput, StorefrontProductDetail } from '@/types/Storefront/storefrontTypes';
import { StorefrontAvailabilityBadge } from './StorefrontAvailabilityBadge';

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function StorefrontAddToCartDrawer({
  opened,
  product,
  form,
  loading,
  onClose,
  onSubmit
}: Readonly<{
  opened: boolean;
  product: StorefrontProductDetail | null;
  form: UseFormReturnType<StorefrontAddToCartInput>;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}>) {
  const sellableSkus = product?.skus.filter((sku) => sku.availableQuantity > 0) ?? [];
  const selectedSku = sellableSkus.find((sku) => sku.id === form.getValues().skuId);

  const inputStyles = {
    input: {
      background: 'var(--tt-surface)',
      border: '1px solid rgba(184, 147, 62, 0.15)',
      color: 'var(--tt-cream)',
      '&:focus': {
        borderColor: 'var(--tt-gold)',
        boxShadow: '0 0 0 2px rgba(184, 147, 62, 0.12)'
      }
    },
    label: { color: 'var(--tt-cream-muted)', fontSize: '0.78rem', fontWeight: 600 }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <span style={{ fontFamily: 'var(--tt-font-editorial)', fontWeight: 600, color: 'var(--tt-cream)' }}>
          Add to cart
        </span>
      }
      position="right"
      size="md"
      classNames={{ content: 'tt-drawer', header: 'tt-drawer-header' }}
    >
      {product ? (
        <motion.form
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
          onSubmit={form.onSubmit(onSubmit)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--tt-font-editorial)', fontWeight: 600,
                fontSize: '1.2rem', color: 'var(--tt-cream)', margin: 0, marginBottom: 4
              }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-dim)', margin: 0 }}>
                Choose one option.
              </p>
            </div>

            <Radio.Group label="Option" key={form.key('skuId')} {...form.getInputProps('skuId')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {product.skus.map((sku) => (
                  <Radio.Card
                    key={sku.id}
                    value={sku.id}
                    disabled={sku.availableQuantity <= 0}
                    p="sm"
                    radius="md"
                    withBorder
                    styles={{
                      card: {
                        background: 'var(--tt-surface)',
                        borderColor: 'rgba(184, 147, 62, 0.12)',
                        color: 'var(--tt-cream)',
                        '&[data-checked]': {
                          borderColor: 'var(--tt-gold)',
                          background: 'rgba(184, 147, 62, 0.06)'
                        }
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--tt-cream)', margin: 0, fontSize: '0.9rem' }}>
                          {sku.name}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--tt-gold)', margin: 0, marginTop: 2 }}>
                          {formatMoney(sku.priceCents, sku.currency)}
                        </p>
                      </div>
                      <StorefrontAvailabilityBadge availability={sku.availability} />
                    </div>
                  </Radio.Card>
                ))}
              </div>
            </Radio.Group>

            {selectedSku ? (
              <NumberInput
                label="Quantity"
                min={1}
                max={selectedSku.availableQuantity}
                key={form.key('quantity')}
                {...form.getInputProps('quantity')}
                styles={inputStyles}
              />
            ) : (
              <NumberInput
                label="Quantity"
                min={1}
                key={form.key('quantity')}
                {...form.getInputProps('quantity')}
                styles={inputStyles}
              />
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                className="tt-btn-secondary"
                onClick={onClose}
                style={{ padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tt-btn-primary"
                disabled={sellableSkus.length === 0 || loading}
                style={{
                  padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem',
                  opacity: sellableSkus.length === 0 ? 0.5 : 1
                }}
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </motion.form>
      ) : null}
    </Drawer>
  );
}
