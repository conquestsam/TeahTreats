'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

type LegalPageContentProps = Readonly<{
  title: string;
  updatedAt: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
}>;

export function LegalPageContent({ title, updatedAt, intro, sections }: LegalPageContentProps) {
  return (
    <div>
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container" style={{ maxWidth: 720 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--tt-cream-dim)', marginBottom: 8 }}>
            Last updated {updatedAt}
          </p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: 12 }}>
            {title}
          </h1>
          <p className="tt-body">{intro}</p>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 64px', maxWidth: 720 }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div className="tt-divider" />

            {sections.map((section) => (
              <div key={section.heading} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h2 className="tt-editorial" style={{ fontSize: '1.15rem' }}>
                  {section.heading}
                </h2>
                <ul style={{
                  margin: 0, paddingLeft: 20,
                  display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  {section.body.map((item) => (
                    <li key={item} style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', lineHeight: 1.65 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-dim)', marginTop: 8 }}>
              Questions? Contact support from your order page or email the store owner listed on your receipt.
            </p>
            <Link href="/products" style={{
              color: 'var(--tt-gold)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none'
            }}>
              Continue shopping →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
