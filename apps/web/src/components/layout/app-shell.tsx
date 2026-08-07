'use client';

import { useEffect, useRef, useState } from 'react';
import { Burger, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TeahTreatsCursor } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsCursor';
import { TeahTreatsLogo } from '@/components/functional-components/TeahTreatsStorefront/TeahTreatsLogo';
import { useCustomerCartQuery } from '@/hooks/CustomerCart/useCustomerCartQuery';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';

import { useCustomerLogoutMutation } from '@/hooks/CustomerAuth/useCustomerAuthMutations';

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [opened, { open, close }] = useDisclosure(false);
  const cartQuery = useCustomerCartQuery();
  const customerQuery = useCurrentCustomerQuery();
  const logoutMutation = useCustomerLogoutMutation();
  const [isShaking, setIsShaking] = useState(false);

  const totalCartCount = cartQuery.data?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const previousCountRef = useRef(totalCartCount);

  useEffect(() => {
    if (totalCartCount > previousCountRef.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 750);
      previousCountRef.current = totalCartCount;
      return () => clearTimeout(timer);
    }
    previousCountRef.current = totalCartCount;
  }, [totalCartCount]);

  const isAuthed = Boolean(customerQuery.data);

  const guestLinks = [
    { href: '/products', label: 'Collections' },
    { href: '/bundles', label: 'Bundles' },
    { href: '/office-snack-planner', label: 'Office Plans' },
    { href: '/products?occasion=Gift', label: 'Gifting' }
  ];

  const authLinks = [
    { href: '/products', label: 'Collections' },
    { href: '/account', label: 'Dashboard' },
    { href: '/account/orders', label: 'My Orders' },
    { href: '/account/loyalty', label: 'Rewards & Perks' },
    { href: '/office-snack-planner', label: 'Office Plans' }
  ];

  const navLinks = isAuthed ? authLinks : guestLinks;

  const isActive = (href: string) =>
    pathname === href || (href === '/products' && pathname.startsWith('/products'));

  return (
    <div className="tt-shell">
      <TeahTreatsCursor />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40" style={{
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid rgba(184, 147, 62, 0.18)'
      }}>
        <div className="tt-container" style={{ paddingBlock: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <TeahTreatsLogo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex" style={{ gap: 28, alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as never}
                  className={isActive(link.href) ? 'tt-nav-link tt-nav-link-active' : 'tt-nav-link'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <Link href="/search" className="tt-icon-action" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                borderRadius: 10, textDecoration: 'none'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </Link>

              <Link
                href="/cart"
                className={`tt-cart-action ${isShaking ? 'tt-cart-shake' : ''}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                  borderRadius: 10, textDecoration: 'none', position: 'relative'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                <span
                  className={
                    isShaking
                      ? 'tt-cart-shake tt-cart-badge-pop'
                      : totalCartCount > 0
                      ? 'tt-cart-badge-continuous'
                      : ''
                  }
                  style={{
                    background: 'var(--tt-crimson)', color: 'var(--tt-cream)',
                    fontSize: '0.65rem', fontWeight: 800, borderRadius: '50%',
                    minWidth: 20, height: 20, padding: '0 4px', display: 'inline-flex', alignItems: 'center',
                    justifyContent: 'center', marginLeft: 2
                  }}
                >
                  {totalCartCount}
                </span>
              </Link>

              <Link href={(isAuthed ? "/account" : "/login") as never} className="hidden sm:inline-flex" style={{
                alignItems: 'center', padding: '10px 22px', borderRadius: 10,
                border: '1px solid rgba(184, 147, 62, 0.4)',
                background: isAuthed ? 'rgba(184, 147, 62, 0.08)' : 'transparent',
                color: 'var(--tt-cream)', fontSize: '0.88rem', fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
              }}>
                {isAuthed ? (customerQuery.data?.name.split(' ')[0] || 'Account') : 'Sign In'}
              </Link>

              <Burger
                opened={opened}
                onClick={open}
                hiddenFrom="lg"
                aria-label="Open navigation"
                color="#FAF7F2"
                size="sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <Drawer
        opened={opened}
        onClose={close}
        title={<TeahTreatsLogo />}
        position="right"
        size="300px"
        classNames={{ content: 'tt-drawer', header: 'tt-drawer-header' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {[
            ...navLinks,
            { href: '/search', label: 'Search' },
            { href: '/cart', label: 'Cart' }
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href as never}
              onClick={close}
              style={{
                display: 'flex', alignItems: 'center', padding: '14px 18px',
                borderRadius: 12, border: '1px solid rgba(184, 147, 62, 0.15)',
                background: 'rgba(30, 30, 30, 0.6)',
                color: 'var(--tt-cream)', fontSize: '0.95rem', fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {link.label}
            </Link>
          ))}

          {isAuthed ? (
            <button
              type="button"
              onClick={() => {
                close();
                logoutMutation.mutate();
              }}
              style={{
                display: 'flex', alignItems: 'center', padding: '14px 18px',
                borderRadius: 12, border: '1px solid rgba(155, 27, 48, 0.35)',
                color: '#f87171', background: 'rgba(155, 27, 48, 0.12)',
                fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', width: '100%', marginTop: 12
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={close}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 18px',
                borderRadius: 12, border: '1px solid rgba(184, 147, 62, 0.4)',
                background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))',
                color: 'var(--tt-cream)', fontSize: '0.95rem', fontWeight: 700,
                textDecoration: 'none', marginTop: 12
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </Drawer>

      {/* ── Main Content ── */}
      <main style={{ minHeight: '100vh', background: 'var(--tt-obsidian)', color: 'var(--tt-cream)' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(184, 147, 62, 0.12)',
        background: '#080808'
      }}>
        <div className="tt-container" style={{ paddingBlock: '56px' }}>
          <div className="footer-grid" style={{
            display: 'grid', gap: 40, gridTemplateColumns: '1fr',
            alignItems: 'start'
          }}>
            {/* Brand column */}
            <div>
              <TeahTreatsLogo />
              <p style={{
                maxWidth: 360, fontSize: '0.85rem', lineHeight: 1.7,
                color: 'var(--tt-cream-muted)', marginTop: 16
              }}>
                Premium curated snacks for home treats, thoughtful gifts, office planning, and every craving in between. Freshness checked, allergen labeled, ready when you are.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase' as const, color: 'var(--tt-gold)', marginBottom: 16
              }}>Quick Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/products', label: 'All Snacks' },
                  { href: '/bundles', label: 'Bundles' },
                  { href: '/office-snack-planner', label: 'Office Plans' },
                  { href: '/products?occasion=Gift', label: 'Gifting' },
                  { href: '/account', label: 'Dashboard' },
                  { href: '/account/orders', label: 'My Orders' },
                  { href: '/account/loyalty', label: 'Rewards' }
                ].map((link) => (
                  <Link key={link.href} href={link.href as never} style={{
                    fontSize: '0.85rem', color: 'var(--tt-cream-muted)',
                    textDecoration: 'none', transition: 'color 0.2s'
                  }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support links */}
            <div>
              <p style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase' as const, color: 'var(--tt-gold)', marginBottom: 16
              }}>Support</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/refund-policy', label: 'Refund Policy' },
                  { href: '/allergy-disclaimer', label: 'Allergy Disclaimer' }
                ].map((link) => (
                  <Link key={link.href} href={link.href as never} style={{
                    fontSize: '0.85rem', color: 'var(--tt-cream-muted)',
                    textDecoration: 'none', transition: 'color 0.2s'
                  }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="tt-divider" style={{ marginTop: 40, marginBottom: 20 }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--tt-cream-dim)', margin: 0 }}>
              © {new Date().getFullYear()} TeahTreats. All rights reserved.
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--tt-cream-dim)', margin: 0 }}>
              Crafted with care for snack lovers everywhere.
            </p>
          </div>
        </div>

        <style>{`
          @media (min-width: 768px) {
            .footer-grid {
              grid-template-columns: 1.4fr 0.8fr 0.8fr !important;
            }
          }
        `}</style>
      </footer>
    </div>
  );
}
