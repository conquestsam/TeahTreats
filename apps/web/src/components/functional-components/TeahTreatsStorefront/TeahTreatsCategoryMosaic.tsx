'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const categories = [
  {
    name: 'Party Trays',
    description: 'Puff puff, samosas, spring rolls, and ready-to-share combos.',
    count: '2',
    image: '/brand/products/party-snack-combo.jpg',
    featured: true
  },
  {
    name: 'Fresh Pastries',
    description: 'Meat pies, puff puff, and scotch egg bites prepared fresh.',
    count: '3',
    image: '/brand/products/classic-meat-pie-tray.jpg'
  },
  {
    name: 'Signature Drinks',
    description: 'Refreshing TeshTreats Zobo made with sorrel and fruit.',
    count: '1',
    image: '/brand/products/signature-zobo-label.jpeg'
  },
  {
    name: 'Celebration Cakes',
    description: 'Custom cakes for birthdays, anniversaries, and milestones.',
    count: '4',
    image: '/brand/products/custom-celebration-cakes-hero.jpg'
  },
  {
    name: 'Office Planning',
    description: 'Simple snack trays for meetings, teams, and shared tables.',
    count: '1',
    image: '/brand/products/puff-puff-tray.jpg'
  }
];

export function TeahTreatsCategoryMosaic() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-32, 32]);

  return (
    <section ref={sectionRef} className="tt-section tt-section-dark">
      <div className="tt-container">
        <div className="tt-section-heading">
          <div>
            <p className="tt-eyebrow">Explore Categories</p>
            <h2 className="tt-display">Choose what you need.</h2>
            <p className="tt-body">
              Simple food groups for real orders: trays, pastries, drinks, cakes, and office planning.
            </p>
          </div>
        </div>
        <div className="tt-mosaic tt-motion-category-grid">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className={cat.featured ? 'tt-mosaic-featured' : undefined}
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`tt-mosaic-tile tt-motion-category-card${cat.featured ? ' tt-mosaic-featured' : ''}`}
                style={{ minHeight: cat.featured ? 440 : 220 }}
              >
                {cat.featured ? (
                  <motion.img
                    src={cat.image}
                    alt={cat.name}
                    className="tt-motion-category-image"
                    style={{ y }}
                  />
                ) : (
                  <motion.img
                    src={cat.image}
                    alt={cat.name}
                    className="tt-motion-category-image"
                  />
                )}
                <div className="tt-mosaic-tile-overlay" />
                <div className="tt-category-shimmer" aria-hidden="true" />
                <div className="tt-mosaic-tile-content">
                  <p className="tt-eyebrow" style={{ marginBottom: 6, fontSize: '0.65rem' }}>{cat.count} snacks</p>
                  <h3 className="tt-editorial" style={{ fontSize: cat.featured ? '1.7rem' : '1.22rem', margin: 0 }}>
                    {cat.name}
                  </h3>
                  <p className="tt-category-description">{cat.description}</p>
                  <span className="tt-category-link-text">Shop category</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
