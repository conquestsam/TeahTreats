'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const categories = [
  {
    name: 'Sweet Treats',
    slug: 'sweet-treats',
    count: '48',
    image: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    featured: true
  },
  {
    name: 'Savory Bites',
    slug: 'savory-bites',
    count: '31',
    image: 'https://plus.unsplash.com/premium_photo-1718221058085-7b81f1226d6b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Healthy Picks',
    slug: 'healthy-picks',
    count: '26',
    image: 'https://plus.unsplash.com/premium_photo-1663011666483-ac74795eb4a0?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Party Packs',
    slug: 'party-packs',
    count: '22',
    image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?q=80&w=1400&auto=format&fit=crop'
  },
  {
    name: 'Office Favorites',
    slug: 'office-favorites',
    count: '19',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1400&auto=format&fit=crop'
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
            <h2 className="tt-display">Every Craving, One Address</h2>
            <p className="tt-body">
              Glide through fresh, sweet, savory, healthy, party, and office-ready snack worlds.
            </p>
          </div>
        </div>
        <div className="tt-mosaic tt-motion-category-grid">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className={cat.featured ? 'tt-mosaic-featured' : undefined}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className={`tt-mosaic-tile tt-motion-category-card${cat.featured ? ' tt-mosaic-featured' : ''}`}
                style={{ minHeight: cat.featured ? 440 : 220 }}
                data-cursor="Explore"
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
