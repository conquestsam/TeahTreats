'use client';

import { PasswordInput, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import Link from 'next/link';
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
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
