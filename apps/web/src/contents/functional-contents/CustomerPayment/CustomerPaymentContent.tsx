'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { StripePaymentWrapper } from '@/components/functional-components/CustomerPayment/StripePaymentForm';
import { PaypalPaymentForm } from '@/components/functional-components/CustomerPayment/PaypalPaymentForm';
import { useCustomerPaymentMutations } from '@/hooks/CustomerPayment/useCustomerPaymentMutations';
import { useCustomerPaymentStatusQuery, useManualPaymentMethodQuery, usePaymentGatewaysQuery } from '@/hooks/CustomerPayment/useCustomerPaymentQuery';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useCustomerOrderRealtime } from '@/hooks/Realtime/useCustomerOrderRealtime';
import type { CustomerPaymentModel } from '@/types/CustomerPayment/customerPaymentTypes';

type PaymentProviderTab = 'stripe' | 'paypal' | 'manual';

export function CustomerPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const customerQuery = useCurrentCustomerQuery();
  const methodsQuery = useManualPaymentMethodQuery();
  const gatewaysQuery = usePaymentGatewaysQuery();
  const gateways = gatewaysQuery.data;

  const customer = customerQuery.data;
  const customerEmail = customer?.email ?? '';

  const [enteredPhone, setEnteredPhone] = useState('');
  useEffect(() => {
    if (customer?.phone) {
      setEnteredPhone(customer.phone);
    }
  }, [customer?.phone]);

  const activePhone = enteredPhone.trim();

  const [activeTab, setActiveTab] = useState<PaymentProviderTab>('stripe');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Manual payment receipt image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canCheckStatus = Boolean(orderId && customerEmail && activePhone);
  const statusQuery = useCustomerPaymentStatusQuery(
    {
      orderId,
      email: customerEmail,
      phone: activePhone
    },
    canCheckStatus && pending
  );

  useCustomerOrderRealtime({
    orderId,
    email: customerEmail,
    phone: activePhone,
    enabled: pending
  });

  const mutations = useCustomerPaymentMutations(() => {
    setPending(true);
  });

  const methods = methodsQuery.data ?? [];
  const selectedMethod = methods.find((m) => m.id === selectedMethodId) ?? methods[0];

  // Helper to initialize Stripe PaymentIntent
  const handleInitiateStripe = () => {
    if (!orderId) {
      notifications.show({ color: 'red', title: 'Invalid Order', message: 'No Order ID provided.' });
      return;
    }
    if (!activePhone) {
      notifications.show({
        color: 'red',
        title: 'Phone Number Required',
        message: 'Please enter a valid contact phone number so our team can coordinate your order.'
      });
      return;
    }
    mutations.initiateMutation.mutate(
      {
        orderId,
        email: customerEmail,
        phone: activePhone,
        provider: 'stripe'
      },
      {
        onSuccess: (payment: CustomerPaymentModel) => {
          const secret = (payment.metadata as { client_secret?: string })?.client_secret;
          if (secret) {
            setStripeClientSecret(secret);
          } else {
            setPending(true);
          }
        }
      }
    );
  };

  // Auto-initiate Stripe intent when Credit Card tab is selected
  useEffect(() => {
    if (activeTab === 'stripe' && !stripeClientSecret && canCheckStatus && !mutations.initiateMutation.isPending) {
      handleInitiateStripe();
    }
  }, [activeTab, canCheckStatus]);

  // Helper to initialize PayPal order
  const handleInitiatePaypal = async (): Promise<string> => {
    if (!activePhone) {
      notifications.show({
        color: 'red',
        title: 'Phone Number Required',
        message: 'Please enter a valid contact phone number so our team can coordinate your order.'
      });
      throw new Error('Phone number is required.');
    }
    const payment = await mutations.initiateMutation.mutateAsync({
      orderId,
      email: customerEmail,
      phone: activePhone,
      provider: 'paypal'
    });
    const pId = (payment.metadata as { id?: string })?.id || payment.providerRef || payment.id;
    setPaypalOrderId(pId);
    return pId;
  };

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit manual proof with direct image upload
  const handleSubmitManualProof = async () => {
    if (!activePhone) {
      notifications.show({
        color: 'red',
        title: 'Phone Number Required',
        message: 'Please enter a valid contact phone number so our team can coordinate your order.'
      });
      return;
    }
    if (!selectedFile || !selectedMethod) {
      notifications.show({ color: 'red', title: 'Receipt Image Required', message: 'Please select a receipt image file.' });
      return;
    }
    setIsUploading(true);
    try {
      const upload = await mutations.uploadMutation.mutateAsync({
        orderId,
        email: customerEmail,
        phone: activePhone,
        contentType: selectedFile.type || 'image/jpeg'
      });

      // Execute HTTP upload if signed URL exists
      if (upload.uploadUrl && !upload.uploadUrl.includes('placeholder')) {
        await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type },
          body: selectedFile
        });
      }

      await mutations.proofMutation.mutateAsync({
        orderId,
        email: customerEmail,
        phone: activePhone,
        manualPaymentMethodId: selectedMethod.id,
        receiptUrl: upload.publicUrl,
        contentType: selectedFile.type || 'image/jpeg',
        ...(upload.objectKey ? { objectKey: upload.objectKey } : {}),
        ...(upload.provider ? { storageProvider: upload.provider } : {})
      });

      notifications.show({
        color: 'green',
        title: 'Payment Proof Submitted',
        message: 'Your receipt was uploaded successfully and is under review.'
      });
      setPending(true);
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Upload Failed',
        message: err instanceof Error ? err.message : 'Could not submit payment proof.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isCompleted =
    statusQuery.data?.status === 'completed' ||
    statusQuery.data?.status === 'paid' ||
    statusQuery.data?.orderStatus === 'completed';

  return (
    <div>
      {/* Page Header */}
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <p className="tt-eyebrow" style={{ marginBottom: 8 }}>Secure Payment Portal</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', margin: 0 }}>
            Complete Your Payment
          </h1>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '36px 64px', maxWidth: 720 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Order Verification Summary Card */}
          <div className="tt-panel" style={{ padding: '24px 28px', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--tt-gold)', fontWeight: 700, margin: 0 }}>
                  Verified Order Record
                </p>
                <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '1.4rem', color: 'var(--tt-cream)', margin: '4px 0 0', fontWeight: 600 }}>
                  Order #{orderId ? orderId.slice(0, 8) : 'Pending'}
                </p>
              </div>
              <span className="tt-badge-gold" style={{ padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                SSL Encrypted
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: 'var(--tt-surface)', padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(184, 147, 62, 0.12)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Email</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--tt-cream)' }}>
                  {customerEmail || 'Session Email Unresolved'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact Phone</span>
                {customer?.phone ? (
                  <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--tt-cream)' }}>{customer.phone}</p>
                ) : (
                  <TextInput
                    placeholder="Enter phone number (+1...)"
                    value={enteredPhone}
                    onChange={(e) => setEnteredPhone(e.currentTarget.value)}
                    size="xs"
                    styles={{
                      input: {
                        background: 'rgba(20, 20, 20, 0.8)',
                        color: 'var(--tt-cream)',
                        borderColor: 'var(--tt-gold-muted)',
                        marginTop: 4
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Payment Success Screen */}
          {isCompleted ? (
            <div
              className="tt-panel"
              style={{
                padding: 40,
                borderRadius: 16,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12), rgba(184, 147, 62, 0.05))',
                border: '1.5px solid rgba(74, 222, 128, 0.4)'
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74, 222, 128, 0.18)', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#4ade80' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="tt-editorial" style={{ fontSize: '1.6rem', color: 'var(--tt-cream)', marginBottom: 8 }}>
                Payment Processed & Verified
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tt-cream-muted)', marginBottom: 28, maxWidth: 440, marginInline: 'auto', lineHeight: 1.6 }}>
                Your order is confirmed and being prepared by our culinary team. You can inspect live progress anytime on your customer account dashboard.
              </p>
              <a
                href="/account"
                className="tt-btn-primary"
                style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}
              >
                Go to Account Dashboard →
              </a>
            </div>
          ) : (
            /* Enterprise Payment Option Cards (Zero Emojis) */
            <div className="tt-panel" style={{ padding: 28, borderRadius: 16 }}>
              <p style={{ fontWeight: 700, color: 'var(--tt-cream)', marginBottom: 20, fontSize: '1rem', letterSpacing: '0.01em' }}>
                Select Payment Method
              </p>

              {/* Large Gateway Option Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
                {/* Option 1: Credit Card */}
                <button
                  type="button"
                  disabled={gateways && !gateways.stripe?.isAvailable}
                  onClick={() => setActiveTab('stripe')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: activeTab === 'stripe' ? '2px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.18)',
                    background: activeTab === 'stripe' ? 'rgba(184, 147, 62, 0.12)' : 'var(--tt-surface)',
                    opacity: (gateways && !gateways.stripe?.isAvailable) ? 0.5 : 1,
                    cursor: (gateways && !gateways.stripe?.isAvailable) ? 'not-allowed' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>Credit / Debit Card</span>
                    {gateways && !gateways.stripe?.isAvailable && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--tt-crimson-light)', background: 'rgba(225,29,72,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>
                    {gateways?.stripe?.isAvailable ? 'Visa, Mastercard, Amex, Apple Pay' : 'Stripe credentials missing in .env'}
                  </span>
                </button>

                {/* Option 2: PayPal */}
                <button
                  type="button"
                  disabled={!gateways?.paypal?.isAvailable}
                  onClick={() => setActiveTab('paypal')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: activeTab === 'paypal' ? '2px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.18)',
                    background: activeTab === 'paypal' ? 'rgba(184, 147, 62, 0.12)' : 'var(--tt-surface)',
                    opacity: gateways?.paypal?.isAvailable ? 1 : 0.45,
                    cursor: gateways?.paypal?.isAvailable ? 'pointer' : 'not-allowed',
                    pointerEvents: gateways?.paypal?.isAvailable ? 'auto' : 'none',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>PayPal</span>
                    {!gateways?.paypal?.isAvailable && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--tt-crimson-light)', background: 'rgba(225,29,72,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>
                    {gateways?.paypal?.isAvailable ? 'PayPal Account or Pay Later' : 'Gateway credentials not configured'}
                  </span>
                </button>

                {/* Option 3: Manual Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: activeTab === 'manual' ? '2px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.18)',
                    background: activeTab === 'manual' ? 'rgba(184, 147, 62, 0.12)' : 'var(--tt-surface)',
                    color: activeTab === 'manual' ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === 'manual' ? '0 0 20px rgba(184, 147, 62, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>Bank Transfer</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="21" x2="21" y2="21" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <polyline points="5 10 12 3 19 10" />
                      <line x1="6" y1="10" x2="6" y2="21" />
                      <line x1="10" y1="10" x2="10" y2="21" />
                      <line x1="14" y1="10" x2="14" y2="21" />
                      <line x1="18" y1="10" x2="18" y2="21" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>Wire Transfer, Zelle, Direct Proof</span>
                </button>
              </div>

              {/* Tab 1: Stripe Card Checkout */}
              {activeTab === 'stripe' && (
                <div>
                  {!stripeClientSecret ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          border: '2px solid var(--tt-gold-muted)',
                          borderTopColor: 'var(--tt-gold)',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 14px'
                        }}
                      />
                      <p style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', margin: 0 }}>
                        Initializing Stripe Card Checkout...
                      </p>
                    </div>
                  ) : (
                    <StripePaymentWrapper
                      clientSecret={stripeClientSecret}
                      onSuccess={() => setPending(true)}
                    />
                  )}
                </div>
              )}

              {/* Tab 2: PayPal Smart Buttons */}
              {activeTab === 'paypal' && (
                <div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', marginBottom: 20 }}>
                    Click below to complete payment securely with your PayPal account or Pay Later options.
                  </p>
                  <PaypalPaymentForm
                    paypalOrderId={paypalOrderId ?? undefined}
                    onCreateOrder={handleInitiatePaypal}
                    onSuccess={() => setPending(true)}
                  />
                </div>
              )}

              {/* Tab 3: Bank Transfer (Large Admin Instructions + Direct File Upload & Preview) */}
              {activeTab === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Method Selector Tabs if multiple manual methods exist */}
                  {methods.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {methods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethodId(method.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: (selectedMethodId ?? methods[0]?.id) === method.id ? '1px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.15)',
                            background: (selectedMethodId ?? methods[0]?.id) === method.id ? 'rgba(184, 147, 62, 0.15)' : 'var(--tt-surface)',
                            color: 'var(--tt-cream)'
                          }}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Large Admin-Configured Payment Instructions Display Card */}
                  <div
                    style={{
                      background: 'rgba(30, 30, 30, 0.85)',
                      border: '1.5px solid rgba(184, 147, 62, 0.25)',
                      borderRadius: 14,
                      padding: '24px 28px'
                    }}
                  >
                    <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--tt-gold)', fontWeight: 700, margin: 0, marginBottom: 8 }}>
                      {selectedMethod?.label ?? 'Bank Wire Transfer Details'}
                    </p>
                    <div style={{ color: 'var(--tt-cream)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {selectedMethod?.instructions ?? 'Bank wire transfer details will be displayed here once configured by store admin.'}
                    </div>
                  </div>

                  {/* Direct Receipt Image Upload & Instant Preview */}
                  <div
                    style={{
                      border: '2px dashed rgba(184, 147, 62, 0.3)',
                      borderRadius: 14,
                      padding: 28,
                      textAlign: 'center',
                      background: 'var(--tt-surface)'
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)', marginBottom: 4 }}>
                      Upload Payment Receipt Image
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)', marginBottom: 20 }}>
                      Select a screenshot or receipt image of your bank transfer.
                    </p>

                    {!imagePreview ? (
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px 28px',
                          borderRadius: 10,
                          background: 'rgba(184, 147, 62, 0.12)',
                          border: '1px solid var(--tt-gold)',
                          color: 'var(--tt-gold-light)',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Choose Receipt Image</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        {/* Live Image Preview Thumbnail */}
                        <div
                          style={{
                            maxWidth: 320,
                            maxHeight: 220,
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '1px solid rgba(184, 147, 62, 0.3)',
                            background: '#000'
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Receipt Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)' }}>
                            {selectedFile?.name} ({(selectedFile?.size ? (selectedFile.size / 1024).toFixed(0) : '0')} KB)
                          </span>
                          <label style={{ fontSize: '0.8rem', color: 'var(--tt-gold)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
                            Change File
                            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* One-Click Submit CTA */}
                  <button
                    type="button"
                    className="tt-btn-primary"
                    disabled={!selectedFile || isUploading}
                    onClick={handleSubmitManualProof}
                    style={{
                      padding: '14px 28px',
                      borderRadius: 12,
                      cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      width: '100%',
                      opacity: !selectedFile || isUploading ? 0.6 : 1
                    }}
                  >
                    {isUploading ? 'Uploading & Submitting Proof...' : 'Submit Payment Proof →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real-time Status Tracker */}
          {pending && !isCompleted && (
            <div className="tt-panel" style={{ padding: '24px 28px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontWeight: 700, color: 'var(--tt-cream)', margin: 0 }}>Live Payment Status</p>
                <span className="tt-badge-gold" style={{ padding: '4px 14px', borderRadius: 20 }}>
                  {statusQuery.data?.status ?? 'Processing...'}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', marginBottom: 16 }}>
                {statusQuery.data?.orderStatus
                  ? `Order status: ${statusQuery.data.orderStatus.replaceAll('_', ' ')}.`
                  : 'We will update status automatically upon verification.'}
              </p>
              <Button
                variant="outline"
                loading={statusQuery.isFetching}
                onClick={() => void statusQuery.refetch()}
                styles={{
                  root: {
                    borderColor: 'var(--tt-gold-muted)',
                    color: 'var(--tt-gold)',
                    '&:hover': { background: 'rgba(184, 147, 62, 0.08)' }
                  }
                }}
              >
                Recheck Status
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
