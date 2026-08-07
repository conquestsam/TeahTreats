'use client';

import Link from 'next/link';

const categories = [
  { name: 'Sweet Treats', slug: 'sweet-treats', gradient: 'linear-gradient(135deg, #3d1a0e, #1a0a05)', featured: true },
  { name: 'Savory Bites', slug: 'savory-bites', gradient: 'linear-gradient(135deg, #1a2e1a, #0a150a)' },
  { name: 'Healthy Picks', slug: 'healthy-picks', gradient: 'linear-gradient(135deg, #1a2e2e, #0a1515)' },
  { name: 'Party Packs', slug: 'party-packs', gradient: 'linear-gradient(135deg, #2e1a2e, #150a15)' },
  { name: 'Office Favorites', slug: 'office-favorites', gradient: 'linear-gradient(135deg, #2e2e1a, #15150a)' }
];

export function TeahTreatsCategoryMosaic() {
  return (
    <section className="tt-section tt-section-dark">
      <div className="tt-container">
        <p className="tt-eyebrow" style={{ marginBottom: 12 }}>Explore Categories</p>
        <h2 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: 40 }}>
          Find your flavor
        </h2>
        <div className="tt-mosaic">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`tt-mosaic-tile${cat.featured ? ' tt-mosaic-featured' : ''}`}
              style={{ minHeight: cat.featured ? 420 : 200 }}
            >
              <div
                className="tt-mosaic-tile-bg"
                style={{ background: cat.gradient }}
              />
              <div className="tt-mosaic-tile-overlay" />
              <div className="tt-mosaic-tile-content">
                <p className="tt-eyebrow" style={{ marginBottom: 6, fontSize: '0.65rem' }}>Category</p>
                <h3 className="tt-editorial" style={{ fontSize: cat.featured ? '1.6rem' : '1.2rem', margin: 0 }}>
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
