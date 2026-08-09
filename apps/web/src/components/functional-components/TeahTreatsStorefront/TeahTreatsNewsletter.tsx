'use client';

import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { subscribeToStorefrontNewsletter } from '@/services/Storefront/storefrontApi';

export function TeahTreatsNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const subscribeMutation = useMutation({
    mutationFn: subscribeToStorefrontNewsletter,
    onSuccess: () => {
      setSubmitted(true);
      notifications.show({
        color: 'green',
        title: 'Subscribed',
        message: 'You are on the TeahTreats list.'
      });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Could not subscribe',
        message: error instanceof Error ? error.message : 'Try again.'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (nextEmail) {
      subscribeMutation.mutate({ email: nextEmail, source: 'homepage-footer' });
    }
  };

  return (
    <section className="tt-section tt-section-charcoal">
      <div className="tt-container" style={{ textAlign: 'center' }}>
        <p className="tt-eyebrow" style={{ marginBottom: 12 }}>Stay in the Loop</p>
        <h2 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: 12 }}>
          Fresh drops, bundles, and exclusive treats.
        </h2>
        <p className="tt-body" style={{ maxWidth: 480, margin: '0 auto 32px' }}>
          Join the TeahTreats community for early access to new collections, seasonal bundles, and member-only offers.
        </p>

        {submitted ? (
          <div style={{
            padding: '16px 24px',
            borderRadius: 12,
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            display: 'inline-block'
          }}>
            <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
              Welcome to the snack squad! Check your inbox.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex', gap: 10, maxWidth: 460, margin: '0 auto',
              flexWrap: 'wrap', justifyContent: 'center'
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tt-newsletter-input"
              required
              aria-label="Email address"
              style={{ flex: '1 1 240px', padding: '10px 16px', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              className="tt-btn-primary"
              disabled={subscribeMutation.isPending}
              style={{
                padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                fontSize: '0.88rem', letterSpacing: '0.02em',
                opacity: subscribeMutation.isPending ? 0.72 : 1
              }}
            >
              {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        <p style={{
          color: 'var(--tt-cream-dim)', fontSize: '0.72rem', marginTop: 16,
          maxWidth: 400, margin: '16px auto 0'
        }}>
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}
