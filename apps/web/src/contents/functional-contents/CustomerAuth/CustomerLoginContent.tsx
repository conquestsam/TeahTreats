'use client';

import { motion } from 'motion/react';
import { useEffect } from 'react';
import { CustomerLoginForm } from '@/components/functional-components/CustomerAuth/CustomerLoginForm';
import { useCustomerLoginForm } from '@/hooks/CustomerAuth/useCustomerAuthForm';
import { useCustomerLoginMutation } from '@/hooks/CustomerAuth/useCustomerAuthMutations';
import { useCurrentCustomerQuery, useCustomerCsrfQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { redirectOnce } from '@/lib/auth/auth-errors';

export function CustomerLoginContent() {
  useCustomerCsrfQuery();
  const form = useCustomerLoginForm();
  const loginMutation = useCustomerLoginMutation();
  const currentCustomerQuery = useCurrentCustomerQuery(true);

  useEffect(() => {
    if (currentCustomerQuery.data) {
      redirectOnce('/account');
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
                Customer Login Page
              </span>
            </div>

            <h1 className="tt-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', marginBottom: 20, lineHeight: 1.1 }}>
              Your cart can move from guest browsing into a customer account without losing quantities.
            </h1>

            <p className="tt-body" style={{ fontSize: '1rem', color: 'var(--tt-cream-muted)', marginBottom: 32 }}>
              Access saved preferences, track live inventory reservations, and earn loyalty perks with every order.
            </p>

            {/* Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="tt-auth-feature">
                <div className="tt-auth-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--tt-cream)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Session preserved when logging in
                  </h4>
                  <p style={{ margin: 0, color: 'var(--tt-cream-muted)', fontSize: '0.78rem' }}>
                    Your session will be preserved when you log in.
                  </p>
                </div>
              </div>

              <div className="tt-auth-feature">
                <div className="tt-auth-feature-icon" style={{ background: 'linear-gradient(135deg, rgba(184, 147, 62, 0.2), rgba(184, 147, 62, 0.1))', borderColor: 'rgba(184, 147, 62, 0.2)', color: 'var(--tt-gold)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--tt-cream)', fontSize: '0.9rem', fontWeight: 600 }}>
                    TeahRewards™ Tier Access
                  </h4>
                  <p style={{ margin: 0, color: 'var(--tt-cream-muted)', fontSize: '0.78rem' }}>
                    Earn 10 pts per $1 spent, unlock exclusive drops, and enjoy free express shipping.
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
          <div style={{ marginBottom: 28 }}>
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
              Sign In to Your Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--tt-cream-muted)', margin: 0 }}>
              Enter your credentials to continue shopping and manage orders.
            </p>
          </div>

          <CustomerLoginForm
            form={form}
            loading={loginMutation.isPending}
            onSubmit={(values) => loginMutation.mutate(values)}
          />
        </motion.div>
      </div>
    </div>
  );
}
