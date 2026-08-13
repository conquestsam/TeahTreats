'use client';

import { PasswordInput, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import Link from 'next/link';
import { buildCustomerOAuthStartUrl } from '@/services/CustomerAuth/customerAuthApi';
import type { CustomerSignupFormValues } from '@/validation/CustomerAuth/customerAuthValidation';

export function CustomerSignupForm({
  form,
  loading,
  onSubmit
}: {
  form: UseFormReturnType<CustomerSignupFormValues>;
  loading: boolean;
  onSubmit: (values: CustomerSignupFormValues) => void;
}) {
  const googleUrl = buildCustomerOAuthStartUrl('google');

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <a
          href={googleUrl}
          className="tt-auth-btn"
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'rgba(250, 247, 242, 0.06)',
            border: '1px solid rgba(184, 147, 62, 0.28)'
          }}
        >
          Continue with Google
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--tt-cream-muted)', fontSize: '0.75rem' }}>
          <span style={{ flex: 1, height: 1, background: 'rgba(184, 147, 62, 0.18)' }} />
          <span>Email sign up</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(184, 147, 62, 0.18)' }} />
        </div>

        <TextInput
          label="Full Name"
          placeholder="Ada Customer"
          autoComplete="name"
          {...form.getInputProps('name')}
          classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
        />

        <TextInput
          label="Email Address"
          placeholder="you@example.com"
          autoComplete="email"
          {...form.getInputProps('email')}
          classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
        />

        <TextInput
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          autoComplete="tel"
          {...form.getInputProps('phone')}
          classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
        />

        <PasswordInput
          label="Create Password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          {...form.getInputProps('password')}
          classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
        />

        <button
          type="submit"
          disabled={loading}
          className="tt-auth-btn"
          style={{ width: '100%', marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid var(--tt-cream-dim)',
                  borderTopColor: 'var(--tt-cream)',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create TeahTreats Account</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.85rem', color: 'var(--tt-cream-muted)' }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: 'var(--tt-gold-light)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </form>
  );
}
