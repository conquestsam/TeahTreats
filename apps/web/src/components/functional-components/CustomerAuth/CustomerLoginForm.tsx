'use client';

import { PasswordInput, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import Link from 'next/link';
import type { CustomerLoginFormValues } from '@/validation/CustomerAuth/customerAuthValidation';

export function CustomerLoginForm({
  form,
  loading,
  onSubmit
}: {
  form: UseFormReturnType<CustomerLoginFormValues>;
  loading: boolean;
  onSubmit: (values: CustomerLoginFormValues) => void;
}) {
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <TextInput
          label="Email Address"
          placeholder="my-email@example.com"
          autoComplete="email"
          {...form.getInputProps('email')}
          classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
        />

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label className="tt-auth-label" style={{ margin: 0 }}>Password</label>
            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--tt-gold)', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
          <PasswordInput
            placeholder="Enter password"
            autoComplete="current-password"
            {...form.getInputProps('password')}
            classNames={{ input: 'tt-auth-input' }}
          />
        </div>

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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.85rem', color: 'var(--tt-cream-muted)' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--tt-gold-light)', fontWeight: 600, textDecoration: 'none' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </form>
  );
}
