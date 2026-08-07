'use client';

const testimonials = [
  {
    text: 'The meat pies arrived fresh, warm packaging, and the flavor was better than any local bakery. TeahTreats changed how I order snacks for the team.',
    author: 'Sarah K.',
    role: 'Office Manager',
    stars: 5
  },
  {
    text: 'Finally a snack shop that checks freshness dates before shipping. The bundle builder is genius — I just pick a budget and flavors, and it handles the rest.',
    author: 'Marcus D.',
    role: 'Repeat Customer',
    stars: 5
  },
  {
    text: 'Ordered the party pack for game night. Every snack was individually sealed, labeled with allergens, and tasted premium. Will order again.',
    author: 'Priya N.',
    role: 'Gift Buyer',
    stars: 5
  }
];

export function TeahTreatsTestimonials() {
  return (
    <section className="tt-section tt-section-elevated">
      <div className="tt-container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="tt-eyebrow" style={{ marginBottom: 12 }}>What Customers Say</p>
          <h2 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
            Real snack lovers, real reviews.
          </h2>
        </div>
        <div className="tt-testimonial-grid" style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
          {testimonials.map((t) => (
            <div key={t.author} className="tt-testimonial">
              <span className="tt-testimonial-quote">&ldquo;</span>
              <p className="tt-testimonial-text">{t.text}</p>
              <div className="tt-testimonial-stars">
                {'★'.repeat(t.stars)}
              </div>
              <p className="tt-testimonial-author">
                {t.author} <span style={{ fontWeight: 400, color: 'var(--tt-cream-dim)', marginLeft: 6 }}>— {t.role}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .tt-testimonial-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
