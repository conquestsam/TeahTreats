'use client';

import { Modal, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import type { CheckoutCustomerFormValues } from '@/validation/CustomerCart/customerCartValidation';
import type { CustomerUserModel } from '@/types/CustomerAuth/customerAuthTypes';

interface CustomerCheckoutModalProps {
  opened: boolean;
  loading: boolean;
  form: UseFormReturnType<CheckoutCustomerFormValues>;
  currentUser?: CustomerUserModel | null | undefined;
  onClose: () => void;
  onSubmit: () => void;
}

export function CustomerCheckoutModal({
  opened,
  loading,
  form,
  currentUser,
  onClose,
  onSubmit
}: CustomerCheckoutModalProps) {
  const isRegistered = Boolean(currentUser);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--tt-font-editorial)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--tt-cream)' }}>
            Shipping & Order Reservation
          </span>
        </div>
      }
      centered
      size="lg"
      classNames={{ content: 'tt-drawer', header: 'tt-drawer-header' }}
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onSubmit={form.onSubmit(onSubmit)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
          {isRegistered && currentUser ? (
            /* Registered User Summary Card */
            <div
              style={{
                background: 'rgba(184, 147, 62, 0.05)',
                border: '1px solid rgba(184, 147, 62, 0.2)',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))',
                    border: '1px solid var(--tt-gold-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--tt-cream)',
                    fontWeight: 700,
                    fontFamily: 'var(--tt-font-editorial)',
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: 'var(--tt-cream)', fontSize: '0.95rem' }}>
                      {currentUser.name}
                    </span>
                    <span className="tt-badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10 }}>
                      Verified Account
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)' }}>
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--tt-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          ) : null}

          {!isRegistered && (
            <>
              <TextInput
                label="Full Name"
                placeholder="e.g. Jane Doe"
                withAsterisk
                {...form.getInputProps('name')}
                classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
              />
              <TextInput
                label="Email Address"
                placeholder="jane@example.com"
                withAsterisk
                {...form.getInputProps('email')}
                classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
              />
            </>
          )}

          <TextInput
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            withAsterisk
            {...form.getInputProps('phone')}
            classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
          />

          <div>
            <Textarea
              label="Shipping Address"
              placeholder="Street address, city, state, zip code..."
              withAsterisk
              minRows={3}
              {...form.getInputProps('address')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--tt-cream-dim)', marginTop: 6, marginInline: 2 }}>
              Inventory will be reserved for 15 minutes upon confirmation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              type="button"
              className="tt-btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: '0.88rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tt-btn-primary"
              disabled={loading}
              style={{ padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '2px solid var(--tt-cream-muted)',
                      borderTopColor: 'var(--tt-cream)',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  <span>Reserving...</span>
                </>
              ) : (
                <>
                  <span>Reserve Stock & Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.form>
    </Modal>
  );
}
