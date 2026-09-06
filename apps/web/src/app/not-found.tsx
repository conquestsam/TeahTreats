import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'radial-gradient(circle at center, rgba(155,27,48,0.12), transparent 28rem), #080808',
        color: '#FAF7F2',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
      }}
    >
      <section style={{ maxWidth: 680, textAlign: 'center' }}>
        <p style={{ color: '#D4AF37', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12, fontWeight: 800 }}>
          HTTP 404 • Page not found
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 7vw, 4rem)', lineHeight: 1, margin: '12px 0' }}>
          This page does not exist
        </h1>
        <p style={{ color: 'rgba(250,247,242,0.68)', lineHeight: 1.7 }}>
          The link may be broken, or the page may have moved. Return to your dashboard or continue browsing the TeahTreats catalog.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <Link
            href="/admin/dashboard"
            style={{
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 22px',
              borderRadius: 8,
              border: '1px solid rgba(155,27,48,0.6)',
              background: 'linear-gradient(135deg, #9B1B30, #6B0F1F)',
              color: '#FAF7F2',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            Return to dashboard
          </Link>
          <Link
            href="/products"
            style={{
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 22px',
              borderRadius: 8,
              border: '1px solid rgba(250,247,242,0.12)',
              background: 'rgba(250,247,242,0.06)',
              color: '#FAF7F2',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            Browse catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
