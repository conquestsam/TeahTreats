'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Group, Modal, Skeleton, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StorefrontAddToCartDrawer } from '@/components/Storefront/StorefrontAddToCartDrawer';
import { useStorefrontAddToCartForm } from '@/hooks/Storefront/useStorefrontForm';
import { useStorefrontAddToCartMutation } from '@/hooks/Storefront/useStorefrontMutations';
import { useStorefrontModals } from '@/hooks/Storefront/useStorefrontModals';
import { useStorefrontProductDetailQuery } from '@/hooks/Storefront/useStorefrontQuery';
import type { StorefrontProductCard as ProductCardModel } from '@/types/Storefront/storefrontTypes';
import { StorefrontAvailabilityBadge } from './StorefrontAvailabilityBadge';

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) {
    return 'Not priced';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

function productInitials(product: ProductCardModel) {
  return (product.category ?? product.brand ?? product.name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'TT';
}

export function StorefrontProductCard({ product }: Readonly<{ product: ProductCardModel }>) {
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productDetailQuery = useStorefrontProductDetailQuery(product.slug, detailsOpened);
  const addToCartForm = useStorefrontAddToCartForm();
  const addToCartModal = useStorefrontModals();
  const addToCartMutation = useStorefrontAddToCartMutation(addToCartModal.closeAddToCart);
  const detail = productDetailQuery.data;
  const images = useMemo(() => product.images.length > 0 ? product.images : product.image ? [product.image] : [], [product.image, product.images]);
  const primaryImage = images[0] ?? null;
  const secondaryImage = images[1] ?? null;
  const cyclingImage = images[activeImageIndex] ?? primaryImage;
  const modalImages = detail?.images.length ? detail.images : images;
  const activeModalImage = modalImages[activeImageIndex] ?? modalImages[0] ?? null;

  useEffect(() => {
    if (images.length < 2 || detailsOpened) {
      return;
    }

    const pointerMedia = window.matchMedia('(hover: none), (pointer: coarse)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!pointerMedia.matches || reducedMotionMedia.matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [detailsOpened, images.length]);

  useEffect(() => {
    if (!detailsOpened) {
      return;
    }
    setActiveImageIndex(0);
  }, [detailsOpened]);

  const openDetails = () => {
    setActiveImageIndex(0);
    setDetailsOpened(true);
  };

  const openAddToCart = () => {
    if (!detail) {
      openDetails();
      return;
    }
    addToCartForm.reset();
    const firstSellableSku = detail.skus.find((sku) => sku.availableQuantity > 0);
    if (firstSellableSku) {
      addToCartForm.setFieldValue('skuId', firstSellableSku.id);
    }
    addToCartModal.openAddToCart(detail);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.25 }}
        className="h-full"
      >
        <Card className="h-full overflow-hidden border-[#342d32] bg-[#1f1d23]">
        <button
          type="button"
          className="relative block aspect-[1.35] w-full overflow-hidden bg-[#151319]"
          onClick={openDetails}
          aria-label={`View ${product.name}`}
          data-cursor="View"
        >
          {primaryImage ? (
            <>
              <img
                src={cyclingImage?.url ?? primaryImage.url}
                alt={cyclingImage?.alt ?? primaryImage.alt ?? product.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
              {secondaryImage ? (
                <img
                  src={secondaryImage.url}
                  alt={secondaryImage.alt ?? product.name}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 hover:opacity-100"
                  aria-hidden="true"
                />
              ) : null}
            </>
          ) : (
            <div className="tt-image-placeholder tt-product-fallback">
              <span>{productInitials(product)}</span>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <StorefrontAvailabilityBadge availability={product.availability} />
          </div>
          {product.isPerishable ? (
            <div className="absolute right-3 top-3">
              <Badge variant="default">Fresh</Badge>
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="absolute bottom-3 left-3 flex gap-1" aria-label={`${images.length} product images`}>
              {images.slice(0, 4).map((image, index) => (
                <span key={image.id} className={index === activeImageIndex ? 'h-1.5 w-5 rounded-full bg-[#f0c66d]' : 'h-1.5 w-1.5 rounded-full bg-white/35'} />
              ))}
            </div>
          ) : null}
        </button>

        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? <Badge variant="default">{product.category}</Badge> : null}
            {product.dietaryLabels.slice(0, 1).map((label) => (
              <Badge key={label} variant="dark">{label}</Badge>
            ))}
          </div>

          <button type="button" className="text-left" onClick={openDetails}>
            <h3 className="line-clamp-2 text-lg font-black text-[#fff7e8]">{product.name}</h3>
          </button>

          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#bca6a7]">
            {product.description ?? 'Fresh snack ready to order.'}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3">
            <span className="text-xl font-black text-[#fff7e8]">{formatMoney(product.startingPriceCents, product.currency)}</span>
            <span className="text-xs font-bold text-[#f0c66d]">{product.availableQuantity > 0 ? `${product.availableQuantity} available` : 'Sold out'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/products/${product.slug}` as never}>Quick View</Link>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={openAddToCart}
              disabled={product.availableQuantity <= 0}
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
        </Card>
      </motion.article>

      <Modal
        opened={detailsOpened}
        onClose={() => setDetailsOpened(false)}
        title={product.name}
        size="xl"
        centered
        classNames={{ content: 'tt-modal-content', body: 'tt-modal-body', header: 'tt-modal-header' }}
      >
        {productDetailQuery.isLoading ? (
          <Stack gap="md">
            <Skeleton height={260} radius="lg" />
            <Skeleton height={24} width="60%" />
            <Skeleton height={72} />
          </Stack>
        ) : detail ? (
          <div className="tt-product-detail-modal">
            <div>
              <div className="tt-product-detail-image">
                {activeModalImage ? (
                  <img src={activeModalImage.url} alt={activeModalImage.alt ?? detail.name} />
                ) : (
                  <div className="tt-image-placeholder tt-product-fallback">
                    <span>{productInitials(product)}</span>
                  </div>
                )}
              </div>
              {modalImages.length > 1 ? (
                <div className="tt-product-thumbs">
                  {modalImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      className={index === activeImageIndex ? 'is-active' : undefined}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={image.url} alt="" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <Stack gap="md">
              <Group gap="xs">
                {detail.category ? <span className="tt-badge-gold">{detail.category}</span> : null}
                <StorefrontAvailabilityBadge availability={detail.availability} />
                {detail.isPerishable ? <span className="tt-badge-fresh">Fresh</span> : null}
              </Group>
              <div>
                <Text className="tt-eyebrow" mb={6}>{detail.brand ?? 'TeshTreats'}</Text>
                <h2 className="tt-editorial tt-product-detail-title">{detail.name}</h2>
                <p className="tt-body">{detail.description ?? 'Fresh snack ready to order.'}</p>
              </div>
              <Text className="tt-product-price" component="p">
                From {formatMoney(detail.startingPriceCents, detail.currency)}
              </Text>
              <div className="tt-product-sku-list">
                {detail.skus.map((sku) => (
                  <div key={sku.id} className="tt-product-sku-row">
                    <div>
                      <Text fw={800} c="var(--tt-cream)">{sku.name}</Text>
                      <Text size="xs" c="var(--tt-cream-dim)">
                        {sku.availableQuantity > 0 ? `${sku.availableQuantity} available` : 'Not available'}
                      </Text>
                    </div>
                    <Text fw={900} c="var(--tt-gold-light)">
                      {formatMoney(sku.priceCents, sku.currency)}
                    </Text>
                  </div>
                ))}
              </div>
              {detail.tags.length > 0 ? (
                <Group gap="xs">
                  {detail.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="tt-product-pill">{tag}</span>
                  ))}
                </Group>
              ) : null}
              <Group justify="flex-end">
                <Button variant="secondary" onClick={() => setDetailsOpened(false)}>Close</Button>
                <Button
                  onClick={openAddToCart}
                  disabled={detail.availableQuantity <= 0}
                >
                  Add to cart
                </Button>
              </Group>
            </Stack>
          </div>
        ) : (
          <div className="tt-state-card" style={{ padding: 28 }}>
            <h3 className="tt-editorial">This snack is not available right now.</h3>
            <p className="tt-body">It may be sold out or no longer visible.</p>
          </div>
        )}
      </Modal>

      <StorefrontAddToCartDrawer
        opened={addToCartModal.addToCartOpened}
        product={addToCartModal.selectedProduct}
        form={addToCartForm}
        loading={addToCartMutation.isPending}
        onClose={addToCartModal.closeAddToCart}
        onSubmit={() => addToCartMutation.mutate(addToCartForm.getValues())}
      />
    </>
  );
}
