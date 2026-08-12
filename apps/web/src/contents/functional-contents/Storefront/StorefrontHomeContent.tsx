'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { StorefrontProductGrid } from '@/components/functional-components/Storefront/StorefrontProductGrid';
import { TeahTreatsBrandStory } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsBrandStory';
import { TeahTreatsCategoryMosaic } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsCategoryMosaic';
import { TeahTreatsHero } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsHero';
import { TeahTreatsMarquee } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsMarquee';
import { TeahTreatsNewsletter } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsNewsletter';
import { TeahTreatsTestimonials } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsTestimonials';
import {
  useStorefrontProductsQuery,
  useStorefrontRecommendationsQuery
} from '@/hooks/Storefront/useStorefrontQuery';
import type { StorefrontProductCard } from '@/types/Storefront/storefrontTypes';

function ProductRail({
  eyebrow,
  title,
  description,
  products,
  loading,
  error,
  tone = 'dark'
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  products: StorefrontProductCard[];
  loading?: boolean;
  error?: Error | null;
  tone?: 'dark' | 'elevated';
}>) {
  return (
    <section className={`tt-section ${tone === 'elevated' ? 'tt-section-elevated' : 'tt-section-dark'} tt-product-rail-section`}>
      <div className="tt-container">
        <div className="tt-section-heading">
          <div>
            <p className="tt-eyebrow">{eyebrow}</p>
            <h2 className="tt-display">{title}</h2>
            <p className="tt-body">{description}</p>
          </div>
          <Link href="/products" className="tt-btn-secondary tt-section-link">
            Browse all
          </Link>
        </div>
        <StorefrontProductGrid products={products} loading={Boolean(loading)} error={error ?? null} />
      </div>
    </section>
  );
}

function CommercePreviewSection() {
  const previews = [
    {
      eyebrow: 'Party Trays',
      title: 'Build One Tray for the Table',
      text: 'Choose puff puff, samosas, spring rolls, meat pies, and zobo for one clear order.',
      cta: 'Explore trays',
      href: '/bundles',
      mark: 'B'
    },
    {
      eyebrow: 'Office Plans',
      title: 'Feed the Team Without Back-and-Forth',
      text: 'Plan by headcount, budget, dietary notes, and the time the order should be ready.',
      cta: 'Plan office trays',
      href: '/office-snack-planner',
      mark: 'O'
    }
  ];

  return (
    <section className="tt-section tt-section-elevated">
      <div className="tt-container">
        <div className="tt-section-heading">
          <div>
            <p className="tt-eyebrow">Planning</p>
            <h2 className="tt-display">Made for parties, teams, and family tables.</h2>
            <p className="tt-body">
              TeahTreats keeps bulk snack orders practical: pick the tray, confirm the details, and get notified when it is ready.
            </p>
          </div>
        </div>
        <div className="tt-commerce-preview-grid">
          {previews.map((preview, index) => (
            <motion.a
              key={preview.title}
              href={preview.href}
              className="tt-commerce-preview-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              data-cursor="Open"
            >
              <span className="tt-commerce-preview-mark" aria-hidden="true">{preview.mark}</span>
              <p className="tt-eyebrow">{preview.eyebrow}</p>
              <h3 className="tt-editorial">{preview.title}</h3>
              <p className="tt-body">{preview.text}</p>
              <span className="tt-commerce-preview-cta">{preview.cta} {'->'}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatMenuPrice(cents: number | null, currency: string) {
  if (cents === null) {
    return 'Price on request';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

function MenuPreviewSection({ products }: Readonly<{ products: StorefrontProductCard[] }>) {
  const menuProducts = products.slice(0, 5);

  if (menuProducts.length === 0) {
    return null;
  }

  return (
    <section className="tt-section tt-section-dark tt-menu-preview-section">
      <div className="tt-container">
        <div className="tt-section-heading">
          <div>
            <p className="tt-eyebrow">Menu Preview</p>
            <h2 className="tt-display">A short menu. Clear prices.</h2>
            <p className="tt-body">
              Start with the familiar items customers ask for most.
            </p>
          </div>
          <Link href="/products" className="tt-btn-secondary tt-section-link">
            View full menu
          </Link>
        </div>
        <div className="tt-menu-preview-list">
          {menuProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="tt-menu-preview-row">
              <div className="tt-menu-preview-copy">
                <span>{product.category ?? 'TeshTreats'}</span>
                <h3>{product.name}</h3>
                <p>{product.description ?? 'Fresh food ready to order.'}</p>
              </div>
              <strong>{formatMenuPrice(product.startingPriceCents, product.currency)}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StorefrontHomeContent() {
  const newArrivalsQuery = useStorefrontProductsQuery({ page: 1, pageSize: 12, sort: 'newest' });
  const recommendationsQuery = useStorefrontRecommendationsQuery();
  const recommendationSections = recommendationsQuery.data ?? [];
  const allProducts = newArrivalsQuery.data?.items ?? [];
  const productsByCategory = (category: string) => allProducts.filter((product) => product.category === category);
  const signatureDrinks = productsByCategory('Signature Drinks');
  const freshPastries = productsByCategory('Fresh Pastries');
  const partyTrays = productsByCategory('Party Trays');
  const celebrationCakes = productsByCategory('Celebration Cakes');
  const popularProducts = recommendationSections.find((section) => section.key === 'popular')?.items ?? allProducts;
  const freshProducts = recommendationSections.find((section) => section.key === 'fresh')?.items ?? freshPastries;

  return (
    <div>
      <TeahTreatsHero />
      <TeahTreatsMarquee />
      <MenuPreviewSection products={allProducts} />

      <ProductRail
        eyebrow="Signature Drinks"
        title="TeshTreats Zobo"
        description="A refreshing sorrel drink made with real fruit notes and clear serving details."
        products={signatureDrinks}
        loading={newArrivalsQuery.isLoading && allProducts.length === 0}
        error={newArrivalsQuery.error}
      />

      <ProductRail
        eyebrow="Fresh Pastries"
        title="Puff puff, meat pies, and scotch egg bites"
        description="Freshly prepared Nigerian party staples for small orders, trays, and office sharing."
        products={freshPastries}
        loading={newArrivalsQuery.isLoading && allProducts.length === 0}
        error={newArrivalsQuery.error}
        tone="elevated"
      />

      <ProductRail
        eyebrow="Party Trays"
        title="Snack trays for a crowd"
        description="Samosas, spring rolls, puff puff, and combo trays made for celebrations and meetings."
        products={partyTrays}
        loading={newArrivalsQuery.isLoading && allProducts.length === 0}
        error={newArrivalsQuery.error}
      />

      <ProductRail
        eyebrow="Custom Cakes"
        title="Cakes for birthdays and milestones"
        description="Photo cakes, kids cakes, and black-and-gold celebration cakes with simple starting prices."
        products={celebrationCakes}
        loading={newArrivalsQuery.isLoading && allProducts.length === 0}
        error={newArrivalsQuery.error}
        tone="elevated"
      />

      <CommercePreviewSection />
      <ProductRail
        eyebrow="Popular Picks"
        title="What customers ask for first"
        description="A short, backend-backed recommendation rail that stays focused on real TeahTreats products."
        products={popularProducts.slice(0, 4)}
        loading={recommendationsQuery.isLoading && popularProducts.length === 0}
        error={recommendationsQuery.error}
      />
      <TeahTreatsCategoryMosaic />
      <TeahTreatsBrandStory />
      <TeahTreatsTestimonials />
      <TeahTreatsNewsletter />
    </div>
  );
}
