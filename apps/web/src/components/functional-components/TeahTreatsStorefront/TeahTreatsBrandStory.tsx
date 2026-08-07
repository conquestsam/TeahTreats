'use client';

export function TeahTreatsBrandStory() {
  return (
    <section className="tt-section tt-section-dark">
      <div className="tt-container">
        <div style={{ display: 'grid', gap: 48, gridTemplateColumns: '1fr', alignItems: 'center' }}>
          <div className="md-brand-grid" style={{ display: 'grid', gap: 48, alignItems: 'center' }}>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 340 }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #2a1810, #1a0e08, #0A0A0A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(184,147,62,0.2), transparent)',
                  border: '1px solid rgba(184,147,62,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '2.5rem', color: 'var(--tt-gold)' }}>
                    T
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="tt-eyebrow" style={{ marginBottom: 12 }}>Our Story</p>
              <h2 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: 20 }}>
                From kitchen to collection, every snack tells a story.
              </h2>
              <div className="tt-divider-short" style={{ marginBottom: 20 }} />
              <p className="tt-body" style={{ marginBottom: 16 }}>
                TeahTreats started with a simple belief: snacks deserve the same care as a full meal. We partner with
                artisan producers who use real ingredients, honor freshness, and craft flavors that make you pause and savor.
              </p>
              <p className="tt-body">
                Every product in our catalog is checked for freshness, allergen transparency, and taste quality.
                From perishable meat pies shipped same-day to shelf-stable party packs — we curate snacks that
                people actually crave.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-brand-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
