'use client';

import { Modal, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const fulfillmentMethod = form.values.fulfillmentMethod;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--tt-font-editorial)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--tt-cream)' }}>
            Delivery Handoff & Order Review
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

          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              withAsterisk
              {...form.getInputProps('phone')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
            <TextInput
              label="Recipient Name"
              placeholder="Who should receive it?"
              {...form.getInputProps('recipientName')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
          </div>

          <section className="rounded-lg border border-[#342d32] bg-[#151319] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#fff7e8]">Delivery Method</p>
                <p className="text-xs text-[#bca6a7]">Delivery handoff is the default for fresh orders.</p>
              </div>
              <Badge variant="default">Handoff</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { value: 'delivery_handoff', label: 'Delivery Handoff', hint: 'Delivered to recipient' },
                { value: 'store_pickup', label: 'Store Pickup', hint: 'Pick up at store' },
                { value: 'scheduled_delivery', label: 'Scheduled Delivery', hint: 'Choose a window' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    fulfillmentMethod === option.value
                      ? 'rounded-md border border-[#f0c66d] bg-[#473919] p-3 text-left'
                      : 'rounded-md border border-[#342d32] bg-[#1f1d23] p-3 text-left'
                  }
                  onClick={() => form.setFieldValue('fulfillmentMethod', option.value as CheckoutCustomerFormValues['fulfillmentMethod'])}
                >
                  <span className="block text-sm font-black text-[#fff7e8]">{option.label}</span>
                  <span className="mt-1 block text-xs text-[#bca6a7]">{option.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Street Address"
              placeholder="740 Park Avenue"
              {...form.getInputProps('addressLine1')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
            <TextInput
              label="Apt, Suite, Unit"
              placeholder="Apt 14B"
              {...form.getInputProps('addressLine2')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
            <TextInput
              label="City"
              placeholder="New York"
              {...form.getInputProps('city')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="State"
                placeholder="NY"
                {...form.getInputProps('state')}
                classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
              />
              <TextInput
                label="ZIP"
                placeholder="10021"
                {...form.getInputProps('postalCode')}
                classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
              />
            </div>
          </div>

          <Textarea
            label="Delivery Address"
            placeholder="Street address, city, state, zip code..."
            withAsterisk
            minRows={2}
            {...form.getInputProps('address')}
            classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
          />

          <Textarea
            label="Handoff Instructions"
            placeholder="Gate code, front desk, parking note, or pickup instructions."
            minRows={3}
            {...form.getInputProps('handoffInstructions')}
            classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Requested Handoff Date"
              placeholder="Select or enter a delivery date"
              {...form.getInputProps('deliveryDate')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
            <TextInput
              label="Requested Handoff Window"
              placeholder="Example: Afternoon handoff window"
              description="This is a delivery window, not an exact arrival time."
              {...form.getInputProps('deliveryWindow')}
              classNames={{ input: 'tt-auth-input', label: 'tt-auth-label' }}
            />
          </div>

          <p className="text-xs leading-5 text-[#8f7b7d]">
            Your items will be held for 15 minutes after checkout is started.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
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
                  <span>Hold Items & Continue</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.form>
    </Modal>
  );
}
