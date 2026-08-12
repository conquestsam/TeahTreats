'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Group, Modal, Skeleton, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { StorefrontAddToCartDrawer } from '@/components/functional-components/Storefront/StorefrontAddToCartDrawer';
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
        className="tt-card tt-product-card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <button
          type="button"
          className="tt-card-image tt-product-media"
          onClick={openDetails}
          aria-label={`View ${product.name}`}
          data-cursor="View"
        >
          {primaryImage ? (
            <>
              <img
                src={cyclingImage?.url ?? primaryImage.url}
                alt={cyclingImage?.alt ?? primaryImage.alt ?? product.name}
                className="tt-product-img tt-product-img-primary tt-product-img-mobile-cycle"
              />
              {secondaryImage ? (
                <img
                  src={secondaryImage.url}
                  alt={secondaryImage.alt ?? product.name}
                  className="tt-product-img tt-product-img-secondary"
                  aria-hidden="true"
                />
              ) : null}
            </>
          ) : (
            <div className="tt-image-placeholder tt-product-fallback">
              <span>{productInitials(product)}</span>
            </div>
          )}

          <div className="tt-product-badge-left">
            <StorefrontAvailabilityBadge availability={product.availability} />
          </div>
          {product.isPerishable ? (
            <div className="tt-product-badge-right">
              <span className="tt-badge-fresh">Fresh</span>
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="tt-product-image-dots" aria-label={`${images.length} product images`}>
              {images.slice(0, 4).map((image, index) => (
                <span key={image.id} className={index === activeImageIndex ? 'is-active' : undefined} />
              ))}
            </div>
          ) : null}
        </button>

        <div className="tt-card-inner tt-product-body">
          <div className="tt-product-meta-row">
            {product.category ? <span className="tt-badge-gold">{product.category}</span> : null}
            {product.dietaryLabels.slice(0, 1).map((label) => (
              <span key={label} className="tt-product-pill">{label}</span>
            ))}
          </div>

          <button type="button" className="tt-product-title-button" onClick={openDetails}>
            <h3>{product.name}</h3>
          </button>

          <p className="tt-product-description">
            {product.description ?? 'Fresh snack ready to order.'}
          </p>

          <div className="tt-product-footer">
            <span className="tt-product-price">{formatMoney(product.startingPriceCents, product.currency)}</span>
            <span className="tt-product-stock">{product.availableQuantity > 0 ? `${product.availableQuantity} left` : 'Sold out'}</span>
          </div>

          <div className="tt-product-actions">
            <button type="button" className="tt-btn-secondary tt-product-action" onClick={openDetails}>
              View details
            </button>
            <button
              type="button"
              className="tt-btn-primary tt-product-action"
              onClick={openAddToCart}
              disabled={product.availableQuantity <= 0}
            >
              Add
            </button>
          </div>
        </div>
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
                <Text className="tt-eyebrow" mb={6}>{detail.brand ?? 'TeahTreats'}</Text>
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
                <Button variant="subtle" color="gray" onClick={() => setDetailsOpened(false)}>Close</Button>
                <Button
                  onClick={openAddToCart}
                  disabled={detail.availableQuantity <= 0}
                  styles={{ root: { background: 'var(--tt-crimson)' } }}
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
