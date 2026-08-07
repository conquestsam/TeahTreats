'use client';

import { motion } from 'motion/react';
import { useEffect } from 'react';
import { CustomerSignupForm } from '@/components/functional-components/CustomerAuth/CustomerSignupForm';
import { useCustomerSignupForm } from '@/hooks/CustomerAuth/useCustomerAuthForm';
import { useCustomerSignupMutation } from '@/hooks/CustomerAuth/useCustomerAuthMutations';
import { useCurrentCustomerQuery, useCustomerCsrfQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';

export function CustomerSignupContent() {
  useCustomerCsrfQuery();
  const form = useCustomerSignupForm();
  const signupMutation = useCustomerSignupMutation();
  const currentCustomerQuery = useCurrentCustomerQuery();

  useEffect(() => {
    if (currentCustomerQuery.data) {
      window.location.replace('/account');
    }
  }, [currentCustomerQuery.data]);

  return (
    <div className="tt-auth-page">
      {/* ── Left Hero Panel ── */}
      <div className="tt-auth-hero">
        <div className="tt-auth-hero-grid" />
        <div className="tt-auth-hero-glow tt-auth-hero-glow-crimson" />
        <div className="tt-auth-hero-glow tt-auth-hero-glow-gold" />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span className="tt-trust-badge">
                ✨ Exclusive Customer Membership
              </span>
            </div>

            <h1 className="tt-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', marginBottom: 20, lineHeight: 1.1 }}>
              Join TeahTreats for a tailored snacking journey.
            </h1>

            <p className="tt-body" style={{ fontSize: '1rem', color: 'var(--tt-cream-muted)', marginBottom: 32 }}>
              Create an account to automatically pre-fill shipping details, save custom snack boxes, and unlock VIP reward drops.
            </p>

            {/* Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="tt-auth-feature">
                <div className="tt-auth-feature-icon" style={{ background: 'linear-gradient(135deg, rgba(184, 147, 62, 0.2), rgba(184, 147, 62, 0.1))', borderColor: 'rgba(184, 147, 62, 0.2)', color: 'var(--tt-gold)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--tt-cream)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Instant Checkout & Reservation
                  </h4>
                  <p style={{ margin: 0, color: 'var(--tt-cream-muted)', fontSize: '0.78rem' }}>
                    Skip redundant forms during checkout. One-click stock reservation.
                  </p>
                </div>
              </div>

              <div className="tt-auth-feature">
                <div className="tt-auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--tt-cream)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Office & Group Cart Collaboration
                  </h4>
                  <p style={{ margin: 0, color: 'var(--tt-cream-muted)', fontSize: '0.78rem' }}>
                    Share live carts with teammates and friends with real-time sync.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="tt-auth-form-side">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="tt-auth-card"
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))',
                border: '1px solid var(--tt-gold-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--tt-cream)',
                fontSize: '0.9rem',
                fontWeight: 700
              }}>
                T
              </div>
              <span style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '1.1rem', color: 'var(--tt-gold)', fontWeight: 600 }}>
                TeahTreats
              </span>
            </div>
            <h2 className="tt-editorial" style={{ fontSize: '1.6rem', color: 'var(--tt-cream)', margin: '0 0 6px 0' }}>
              Create Your Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--tt-cream-muted)', margin: 0 }}>
              Join now to save your cart and unlock exclusive rewards.
            </p>
          </div>

          <CustomerSignupForm
            form={form}
            loading={signupMutation.isPending}
            onSubmit={(values) => signupMutation.mutate(values)}
          />
        </motion.div>
      </div>
    </div>
  );
}
