export default function Loading() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'radial-gradient(circle at center, rgba(184,147,62,0.14), transparent 28rem), #080808',
        color: '#FAF7F2',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
      }}
    >
      <section style={{ textAlign: 'center' }}>
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            margin: '0 auto 18px',
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(250,247,242,0.04)',
            boxShadow: '0 0 42px rgba(184,147,62,0.16)'
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '38% 62% 45% 55%',
              border: '1px solid #D4AF37',
              background: 'linear-gradient(135deg, rgba(155,27,48,0.48), rgba(184,147,62,0.52))'
            }}
          />
        </div>
        <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 800 }}>
          Tesh<span style={{ color: '#D4AF37' }}>Treats</span>
        </p>
        <p style={{ marginTop: 8, color: 'rgba(250,247,242,0.42)', fontSize: 12, letterSpacing: '0.34em', textTransform: 'uppercase' }}>
          Loading
        </p>
      </section>
    </main>
  );
}
