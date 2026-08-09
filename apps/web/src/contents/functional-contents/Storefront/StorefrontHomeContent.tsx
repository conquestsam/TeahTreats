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
      eyebrow: 'Bundles',
      title: 'Build a Better Snack Box',
      text: 'Bundle fresh pastries, chocolate bites, nuts, and office-safe favorites into one calm order.',
      cta: 'Explore bundles',
      href: '/bundles',
      mark: 'B'
    },
    {
      eyebrow: 'Office Plans',
      title: 'Snack Planning Without Spreadsheets',
      text: 'Plan by team size, budget, dietary needs, freshness window, and repeat favorites.',
      cta: 'Plan office snacks',
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
            <h2 className="tt-display">Made for More Than One Craving</h2>
            <p className="tt-body">
              TeahTreats supports quick personal orders, curated bundles, and office snack planning from the same product catalog.
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

export function StorefrontHomeContent() {
  const newArrivalsQuery = useStorefrontProductsQuery({ page: 1, pageSize: 4, sort: 'newest' });
  const recommendationsQuery = useStorefrontRecommendationsQuery();
  const recommendationSections = recommendationsQuery.data ?? [];
  const fallbackProducts = newArrivalsQuery.data?.items ?? [];
  const popularProducts = recommendationSections.find((section) => section.key === 'popular')?.items ?? fallbackProducts;
  const freshProducts = recommendationSections.find((section) => section.key === 'fresh')?.items ?? fallbackProducts;
  const bundleProducts = recommendationSections.find((section) => section.key === 'dynamic-bundles')?.items ?? popularProducts;

  return (
    <div>
      <TeahTreatsHero />
      <TeahTreatsMarquee />

      <ProductRail
        eyebrow="New Arrivals"
        title="Fresh Snacks Just Landed"
        description="Newly added treats with current pricing, visibility, and availability from the storefront catalog."
        products={fallbackProducts}
        loading={newArrivalsQuery.isLoading}
        error={newArrivalsQuery.error}
      />

      <ProductRail
        eyebrow="Popular Snacks"
        title="Customer Favorites"
        description="A practical first pass at popularity using backend recommendation signals, ready for deeper engagement scoring later."
        products={popularProducts.slice(0, 4)}
        loading={recommendationsQuery.isLoading}
        error={recommendationsQuery.error}
        tone="elevated"
      />

      <ProductRail
        eyebrow="Fresh Picks"
        title="Picked for Today"
        description="Fresh and fast-moving options for personal cravings, office trays, and quick curated gifts."
        products={freshProducts.slice(0, 4)}
        loading={recommendationsQuery.isLoading}
        error={recommendationsQuery.error}
      />

      <ProductRail
        eyebrow="Bundles"
        title="Bundle-Ready Treats"
        description="A focused rail for snacks that can become dynamic bundles without changing checkout inventory rules."
        products={bundleProducts.slice(0, 4)}
        loading={recommendationsQuery.isLoading}
        error={recommendationsQuery.error}
        tone="elevated"
      />

      <CommercePreviewSection />
      <TeahTreatsCategoryMosaic />
      <TeahTreatsBrandStory />
      <TeahTreatsTestimonials />
      <TeahTreatsNewsletter />
    </div>
  );
}
