'use client';

import { motion } from 'motion/react';
import { TeahTreatsHero } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsHero';
import { TeahTreatsCategoryMosaic } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsCategoryMosaic';
import { TeahTreatsMarquee } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsMarquee';
import { TeahTreatsBrandStory } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsBrandStory';
import { TeahTreatsTestimonials } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsTestimonials';
import { TeahTreatsNewsletter } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsNewsletter';
import { StorefrontProductGrid } from '@/components/functional-components/Storefront/StorefrontProductGrid';
import {
  useStorefrontProductsQuery,
  useStorefrontRecommendationsQuery
} from '@/hooks/Storefront/useStorefrontQuery';

export function StorefrontHomeContent() {
  const productsQuery = useStorefrontProductsQuery({ page: 1, pageSize: 4, sort: 'newest' });
  const recommendationsQuery = useStorefrontRecommendationsQuery();
  const recommendationSections = recommendationsQuery.data ?? [];
  const featuredProducts = productsQuery.data?.items ?? [];

  return (
    <div>
      {/* ── Hero ── */}
      <TeahTreatsHero />

      {/* ── Marquee ── */}
      <TeahTreatsMarquee />

      {/* ── Category Mosaic ── */}
      <TeahTreatsCategoryMosaic />

      {/* ── Trending Products ── */}
      <section className="tt-section tt-section-dark">
        <div className="tt-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="tt-eyebrow" style={{ marginBottom: 10 }}>New Arrivals</p>
              <h2 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
                Fresh snacks to start with
              </h2>
            </div>
            <a href="/products" className="tt-btn-secondary" style={{
              display: 'inline-flex', alignItems: 'center', padding: '10px 22px',
              borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem'
            }}>
              Browse All
            </a>
          </div>
          <StorefrontProductGrid products={featuredProducts} loading={productsQuery.isLoading} error={productsQuery.error} />
        </div>
      </section>

      {/* ── Feature Teasers ── */}
      <section className="tt-section tt-section-elevated">
        <div className="tt-container">
          <div className="tt-features-grid" style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
            {[
              {
                eyebrow: 'Bundles',
                title: 'Smart Bundles',
                text: 'Build a custom bundle from fresh and shelf-stable items. Dynamic bundles grow from real product engagement.',
                cta: 'Explore Bundles',
                href: '/bundles'
              },
              {
                eyebrow: 'Office',
                title: 'Office Snack Planning',
                text: 'Plan team snacks around size, freshness, dietary needs, and repeat orders — without the spreadsheet.',
                cta: 'Plan Snacks',
                href: '/office-snack-planner'
              },
              {
                eyebrow: 'Gifting',
                title: 'Thoughtful Gifting',
                text: 'Curate a snack gift for any occasion. Add a note, pick the flavors, and we handle the freshness.',
                cta: 'Send a Gift',
                href: '/products?occasion=Gift'
              }
            ].map((feature) => (
              <motion.a
                key={feature.title}
                href={feature.href}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'block', padding: 28, borderRadius: 16,
                  background: 'var(--tt-charcoal)',
                  border: '1px solid rgba(184, 147, 62, 0.08)',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'border-color 0.3s ease'
                }}
              >
                <p className="tt-eyebrow" style={{ marginBottom: 10 }}>{feature.eyebrow}</p>
                <h3 className="tt-editorial" style={{ fontSize: '1.3rem', marginBottom: 10 }}>
                  {feature.title}
                </h3>
                <p className="tt-body" style={{ marginBottom: 16, fontSize: '0.88rem' }}>
                  {feature.text}
                </p>
                <span style={{
                  color: 'var(--tt-gold)', fontSize: '0.82rem', fontWeight: 600,
                  letterSpacing: '0.02em'
                }}>
                  {feature.cta} →
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .tt-features-grid {
              grid-template-columns: 1fr 1fr 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ── Brand Story ── */}
      <TeahTreatsBrandStory />

      {/* ── Recommendations ── */}
      {recommendationSections.map((section) => (
        <section key={section.key} className="tt-section tt-section-dark">
          <div className="tt-container">
            <div style={{ marginBottom: 32 }}>
              <p className="tt-eyebrow" style={{ marginBottom: 10 }}>For You</p>
              <h2 className="tt-display" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)' }}>
                {section.title}
              </h2>
            </div>
            <StorefrontProductGrid products={section.items} loading={recommendationsQuery.isLoading} />
          </div>
        </section>
      ))}

      {/* ── Testimonials ── */}
      <TeahTreatsTestimonials />

      {/* ── Newsletter ── */}
      <TeahTreatsNewsletter />
    </div>
  );
}
