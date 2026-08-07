import type { CheckoutStartedModel } from '@/types/CustomerCart/customerCartTypes';

export function CustomerCheckoutSummary({ checkout }: { checkout: CheckoutStartedModel }) {
  const expiresAtFormatted = new Date(checkout.reservationExpiresAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className="tt-panel-elevated"
      style={{
        padding: '28px 32px',
        marginBottom: 32,
        borderColor: 'rgba(184, 147, 62, 0.3)',
        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(184, 147, 62, 0.08))'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20 }}>
              Inventory Reserved
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)' }}>
              Order ID: <strong style={{ color: 'var(--tt-cream)' }}>#{checkout.orderId.slice(0, 8)}...</strong>
            </span>
          </div>

          <h2 className="tt-editorial" style={{ fontSize: '1.5rem', color: 'var(--tt-cream)', margin: '0 0 6px 0' }}>
            Your Stock is Held Reserved
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', margin: 0, maxWidth: 520 }}>
            Reserved until <strong>{expiresAtFormatted}</strong> (15 min window). Complete payment to confirm your order.
          </p>

          {checkout.discountCents > 0 && (
            <p style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600, margin: '8px 0 0 0' }}>
              ✨ Applied Discount: -${(checkout.discountCents / 100).toFixed(2)}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Reserved Total
            </span>
            <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--tt-gold-light)', margin: 0 }}>
              ${(checkout.totalCents / 100).toFixed(2)}
            </p>
          </div>

          <a
            href={`/payment?orderId=${checkout.orderId}`}
            className="tt-btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: 'var(--tt-shadow-glow-gold)'
            }}
          >
            <span>Proceed to Payment</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
