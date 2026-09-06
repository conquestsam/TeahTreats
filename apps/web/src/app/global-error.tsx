'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background: 'radial-gradient(circle at center, rgba(155,27,48,0.14), transparent 28rem), #080808',
            color: '#FAF7F2',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
          }}
        >
          <section style={{ maxWidth: 640, textAlign: 'center' }}>
            <p style={{ color: '#D4AF37', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12, fontWeight: 800 }}>
              Operational notice
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 7vw, 4rem)', lineHeight: 1, margin: '12px 0' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'rgba(250,247,242,0.68)', lineHeight: 1.7 }}>
              TeahTreats could not finish loading this view. Your session and saved data remain secure.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                marginTop: 24,
                padding: '0 22px',
                borderRadius: 8,
                border: '1px solid rgba(155,27,48,0.6)',
                background: 'linear-gradient(135deg, #9B1B30, #6B0F1F)',
                color: '#FAF7F2',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Reload page
            </button>
            <p style={{ marginTop: 18, color: 'rgba(250,247,242,0.42)', fontSize: 12 }}>
              Reference: {error.digest ?? 'err_teah_global'}
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
