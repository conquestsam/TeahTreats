'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Modal, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StripePaymentWrapper } from '@/components/CustomerPayment/StripePaymentForm';
import { PaypalPaymentForm } from '@/components/CustomerPayment/PaypalPaymentForm';
import { useCustomerPaymentMutations } from '@/hooks/CustomerPayment/useCustomerPaymentMutations';
import { useCustomerPaymentStatusQuery, useManualPaymentMethodQuery, usePaymentGatewaysQuery } from '@/hooks/CustomerPayment/useCustomerPaymentQuery';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useCustomerOrderDetailsQuery } from '@/hooks/CustomerOrder/useCustomerOrderQuery';
import { useCustomerOrderRealtime } from '@/hooks/Realtime/useCustomerOrderRealtime';
import { formatMoney } from '@/lib/formatters/money';
import type { CustomerPaymentModel } from '@/types/CustomerPayment/customerPaymentTypes';

type PaymentProviderTab = 'stripe' | 'paypal' | 'manual';

export function CustomerPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const customerQuery = useCurrentCustomerQuery();
  const methodsQuery = useManualPaymentMethodQuery();
  const gatewaysQuery = usePaymentGatewaysQuery();
  const gateways = gatewaysQuery.data;
  const methods = methodsQuery.data ?? [];
  const orderDetailsQuery = useCustomerOrderDetailsQuery(customerQuery.data ? orderId : null);
  const order = orderDetailsQuery.data;

  const customer = customerQuery.data;
  const orderCustomer = orderDetailsQuery.data?.customer;
  const [savedContact, setSavedContact] = useState<{ email: string; phone: string; name?: string } | null>(null);

  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPhone, setEnteredPhone] = useState('');
  useEffect(() => {
    if (!orderId || typeof window === 'undefined') {
      return;
    }

    const raw = window.sessionStorage.getItem(`teahTreats.checkout.${orderId}`);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { email?: string; phone?: string; name?: string };
      if (parsed.email && parsed.phone) {
        setSavedContact({
          email: parsed.email,
          phone: parsed.phone,
          ...(parsed.name ? { name: parsed.name } : {})
        });
      }
    } catch {
      window.sessionStorage.removeItem(`teahTreats.checkout.${orderId}`);
    }
  }, [orderId]);

  useEffect(() => {
    const preferredEmail = savedContact?.email ?? orderCustomer?.email ?? customer?.email ?? '';
    if (preferredEmail && !enteredEmail) {
      setEnteredEmail(preferredEmail);
    }
  }, [customer?.email, enteredEmail, orderCustomer?.email, savedContact?.email]);

  useEffect(() => {
    const preferredPhone = savedContact?.phone ?? orderCustomer?.phone ?? customer?.phone ?? '';
    if (preferredPhone && !enteredPhone) {
      setEnteredPhone(preferredPhone);
    }
  }, [customer?.phone, enteredPhone, orderCustomer?.phone, savedContact?.phone]);

  const customerEmail = enteredEmail.trim();
  const activePhone = enteredPhone.trim();
  const emailIsPrefilled = Boolean(savedContact?.email || orderCustomer?.email || customer?.email);
  const phoneIsPrefilled = Boolean(savedContact?.phone || orderCustomer?.phone || customer?.phone);
  const stripeAvailable = Boolean(gateways?.stripe?.isAvailable);
  const paypalAvailable = Boolean(gateways?.paypal?.isAvailable);
  const manualAvailable = Boolean(gateways?.manual?.isAvailable && methods.length > 0);

  const [activeTab, setActiveTab] = useState<PaymentProviderTab>('stripe');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

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
    canCheckStatus
  );
  const latestPayment = statusQuery.data ?? order?.payments[0] ?? null;
  const orderTotal = order ? formatMoney(order.totalCents, order.currency) : 'your order total';
  const paymentReturnUrl = typeof window === 'undefined'
    ? `/orders/${orderId}`
    : `${window.location.origin}/orders/${orderId}`;

  useCustomerOrderRealtime({
    orderId,
    email: customerEmail,
    phone: activePhone,
    enabled: pending
  });

  const showPaymentSuccess = () => {
    setPending(true);
    setProviderError(null);
    setSuccessModalOpen(true);
  };

  const mutations = useCustomerPaymentMutations(showPaymentSuccess);

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) ?? methods[0];
  const bestAvailableTab: PaymentProviderTab =
    stripeAvailable ? 'stripe' : paypalAvailable ? 'paypal' : 'manual';

  useEffect(() => {
    if (!gatewaysQuery.isSuccess && !methodsQuery.isSuccess) {
      return;
    }

    if (activeTab === 'stripe' && !stripeAvailable) {
      setActiveTab(bestAvailableTab);
    }
    if (activeTab === 'paypal' && !paypalAvailable) {
      setActiveTab(bestAvailableTab);
    }
    if (activeTab === 'manual' && !manualAvailable && (stripeAvailable || paypalAvailable)) {
      setActiveTab(bestAvailableTab);
    }
  }, [
    activeTab,
    bestAvailableTab,
    gatewaysQuery.isSuccess,
    manualAvailable,
    methodsQuery.isSuccess,
    paypalAvailable,
    stripeAvailable
  ]);

  useEffect(() => {
    if (!selectedMethodId && methods[0]) {
      setSelectedMethodId(methods[0].id);
    }
  }, [methods, selectedMethodId]);

  const ensurePaymentContact = () => {
    if (!orderId) {
      notifications.show({ color: 'red', title: 'Invalid Order', message: 'No order was found for payment.' });
      return false;
    }
    if (!customerEmail) {
      notifications.show({
        color: 'red',
        title: 'Email Required',
        message: 'Please enter the email address used at checkout.'
      });
      return false;
    }
    if (!activePhone || activePhone.length < 7) {
      notifications.show({
        color: 'red',
        title: 'Phone Number Required',
        message: 'Please enter the phone number used at checkout.'
      });
      return false;
    }
    return true;
  };

  // Helper to initialize Stripe PaymentIntent
  const handleInitiateStripe = () => {
    if (!stripeAvailable) {
      notifications.show({
        color: 'red',
        title: 'Card Payment Unavailable',
        message: gateways?.stripe?.reason ?? 'Stripe is not enabled for this store.'
      });
      return;
    }
    if (!ensurePaymentContact()) {
      return;
    }
    setProviderError(null);
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
            setProviderError('Stripe started, but no secure card form was returned. Please use another payment method or contact support.');
          }
        },
        onError: (error) => {
          setProviderError(error instanceof Error ? error.message : 'Could not start Stripe payment.');
        }
      }
    );
  };

  // Helper to initialize PayPal order
  const handleInitiatePaypal = async (): Promise<string> => {
    if (!paypalAvailable) {
      notifications.show({
        color: 'red',
        title: 'PayPal Unavailable',
        message: gateways?.paypal?.reason ?? 'PayPal is not enabled for this store.'
      });
      throw new Error('PayPal is unavailable.');
    }
    if (!ensurePaymentContact()) {
      throw new Error('Order verification is incomplete.');
    }
    setProviderError(null);
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

  const handleCapturePaypal = async (approvedPaypalOrderId: string) => {
    if (!ensurePaymentContact()) {
      throw new Error('Order verification is incomplete.');
    }
    setProviderError(null);
    await mutations.paypalCaptureMutation.mutateAsync({
      orderId,
      email: customerEmail,
      phone: activePhone,
      paypalOrderId: approvedPaypalOrderId
    });
    showPaymentSuccess();
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
    if (!ensurePaymentContact()) {
      return;
    }
    if (!selectedMethod) {
      notifications.show({ color: 'red', title: 'Choose a payment method', message: 'Select how you paid so we can review your order.' });
      return;
    }
    setIsUploading(true);
    try {
      let receiptUrl: string | undefined;
      let objectKey: string | undefined;
      let storageProvider: string | undefined;

      if (selectedFile) {
        const upload = await mutations.uploadMutation.mutateAsync({
          orderId,
          email: customerEmail,
          phone: activePhone,
          contentType: selectedFile.type || 'image/jpeg',
          sizeBytes: selectedFile.size
        });

        receiptUrl = upload.publicUrl;
        objectKey = upload.objectKey;
        storageProvider = upload.provider;

        if (upload.uploadUrl && !upload.uploadUrl.includes('placeholder')) {
          if (upload.provider === 'cloudinary') {
            const formData = new FormData();
            for (const [key, value] of Object.entries(upload.fields)) {
              formData.append(key, String(value));
            }
            formData.append('file', selectedFile);
            const uploadResponse = await fetch(upload.uploadUrl, {
              method: 'POST',
              body: formData
            });
            if (!uploadResponse.ok) {
              throw new Error('Receipt upload failed.');
            }
            const body = (await uploadResponse.json()) as { secure_url?: string; url?: string };
            receiptUrl = body.secure_url ?? body.url ?? upload.publicUrl;
          } else {
            const uploadResponse = await fetch(upload.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': selectedFile.type },
              body: selectedFile
            });
            if (!uploadResponse.ok) {
              throw new Error('Receipt upload failed.');
            }
          }
        }
      }

      await mutations.proofMutation.mutateAsync({
        orderId,
        email: customerEmail,
        phone: activePhone,
        manualPaymentMethodId: selectedMethod.id,
        ...(receiptUrl ? { receiptUrl } : {}),
        ...(selectedFile ? { contentType: selectedFile.type || 'image/jpeg' } : {}),
        ...(objectKey ? { objectKey } : {}),
        ...(storageProvider ? { storageProvider } : {})
      });

      notifications.show({
        color: 'green',
        title: 'Payment submitted',
        message: 'We received your payment details and will review your order.'
      });
      showPaymentSuccess();
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Payment was not submitted',
        message: err instanceof Error ? err.message : 'Could not submit your payment details.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isCompleted =
    statusQuery.data?.status === 'completed' ||
    statusQuery.data?.status === 'paid' ||
    statusQuery.data?.orderStatus === 'completed';

  if (!orderId) {
    return (
      <main className="tt-container py-12">
        <Card className="mx-auto max-w-xl border-[#342d32] bg-[#1f1d23]">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-black text-[#fff7e8]">No order selected</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#bca6a7]">
              Choose an order from your history or return to the menu to start checkout.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild><Link href="/account/orders">My Orders</Link></Button>
              <Button asChild variant="secondary"><Link href="/products">Continue Shopping</Link></Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div>
      <Modal
        opened={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Order confirmed"
        centered
        size="md"
      >
        <div className="space-y-4">
          <Card className="border-[#342d32] bg-[#1f1d23]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f0c66d]">Payment received</p>
                  <h2 className="mt-1 text-2xl font-black text-[#fff7e8]">Your order is safely logged.</h2>
                </div>
                <Badge variant="green">Session active</Badge>
              </div>
              <p className="text-sm leading-6 text-[#bca6a7]">
                We saved your payment details for order #{orderId.slice(0, 8)}. You can view the exact order, follow its status, or keep shopping without signing out.
              </p>
              <div className="grid gap-2 rounded-lg bg-[#151319] p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#bca6a7]">Customer</span>
                  <span className="truncate font-bold text-[#fff7e8]">{savedContact?.name ?? orderCustomer?.name ?? customer?.name ?? 'Guest customer'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#bca6a7]">Contact</span>
                  <span className="font-bold text-[#fff7e8]">{activePhone || 'Saved at checkout'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild>
              <Link href={`/orders/${orderId}` as never}>View Order Details</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/orders/${orderId}?track=1` as never}>Track Order</Link>
            </Button>
            {!customer ? (
              <Button asChild variant="secondary" className="sm:col-span-2">
                <Link href={`/signup?claimOrderId=${orderId}` as never}>Create Account to Save Order</Link>
              </Button>
            ) : null}
            <Button asChild variant="ghost" className="sm:col-span-2">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Modal>

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
                {emailIsPrefilled ? (
                  <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--tt-cream)' }}>
                    {customerEmail}
                  </p>
                ) : (
                  <TextInput
                    placeholder="Email used at checkout"
                    value={enteredEmail}
                    onChange={(e) => setEnteredEmail(e.currentTarget.value)}
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
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact Phone</span>
                {phoneIsPrefilled ? (
                  <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--tt-cream)' }}>{activePhone}</p>
                ) : (
                  <TextInput
                    placeholder="Phone used at checkout"
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
            {savedContact || orderCustomer ? (
              <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--tt-cream-dim)' }}>
                We filled these details from checkout so you do not have to enter them again.
              </p>
            ) : null}
          </div>

          <PaymentStatePanel
            status={latestPayment?.status ?? (pending ? 'manual_proof_submitted' : 'payment_pending')}
            orderStatus={statusQuery.data?.orderStatus ?? order?.status ?? null}
            amount={latestPayment ? formatMoney(latestPayment.amountCents, latestPayment.currency) : orderTotal}
            orderId={orderId}
            provider={latestPayment?.provider ?? activeTab}
          />

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
                Your order is confirmed and being prepared by our culinary team. You can inspect live progress anytime from this order page.
              </p>
              <a
                href={`/orders/${orderId}`}
                className="tt-btn-primary"
                style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}
              >
                View Order Details →
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
                  disabled={!stripeAvailable}
                  onClick={() => setActiveTab('stripe')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: activeTab === 'stripe' ? '2px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.18)',
                    background: activeTab === 'stripe' ? 'rgba(184, 147, 62, 0.12)' : 'var(--tt-surface)',
                    opacity: stripeAvailable ? 1 : 0.5,
                    cursor: stripeAvailable ? 'pointer' : 'not-allowed',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>Credit / Debit Card</span>
                    {!stripeAvailable && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--tt-crimson-light)', background: 'rgba(225,29,72,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>
                    {stripeAvailable
                      ? 'Visa, Mastercard, Amex, Apple Pay'
                      : gateways?.stripe?.reason ?? 'Stripe is not enabled for this store'}
                  </span>
                </button>

                {/* Option 2: PayPal */}
                <button
                  type="button"
                  disabled={!paypalAvailable}
                  onClick={() => setActiveTab('paypal')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: activeTab === 'paypal' ? '2px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.18)',
                    background: activeTab === 'paypal' ? 'rgba(184, 147, 62, 0.12)' : 'var(--tt-surface)',
                    opacity: paypalAvailable ? 1 : 0.45,
                    cursor: paypalAvailable ? 'pointer' : 'not-allowed',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>PayPal</span>
                    {!paypalAvailable && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--tt-crimson-light)', background: 'rgba(225,29,72,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>
                    {paypalAvailable
                      ? 'PayPal Account or Pay Later'
                      : gateways?.paypal?.reason ?? 'PayPal is not enabled for this store'}
                  </span>
                </button>

                {/* Option 3: Manual Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: activeTab === 'manual' ? '2px solid var(--tt-gold)' : '1px solid rgba(184, 147, 62, 0.3)',
                    background: activeTab === 'manual' ? 'rgba(184, 147, 62, 0.12)' : 'var(--tt-surface)',
                    color: activeTab === 'manual' ? 'var(--tt-gold-light)' : 'var(--tt-cream-muted)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === 'manual' ? '0 0 20px rgba(184, 147, 62, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>Manual Payment</span>
                    {manualAvailable ? (
                      <span style={{ fontSize: '0.7rem', color: '#4ade80', background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                        Available
                      </span>
                    ) : null}
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
                  <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>
                    Zelle, CashApp, Venmo, bank transfer, and receipt upload
                  </span>
                </button>
              </div>

              {providerError ? (
                <div style={{
                  padding: '12px 14px',
                  marginBottom: 18,
                  borderRadius: 10,
                  border: '1px solid rgba(248, 113, 113, 0.35)',
                  background: 'rgba(127, 29, 29, 0.16)',
                  color: '#fecaca',
                  fontSize: '0.86rem'
                }}>
                  {providerError}
                </div>
              ) : null}

              {/* Tab 1: Stripe Card Checkout */}
              {activeTab === 'stripe' && (
                <div>
                  {!stripeAvailable ? (
                    <div className="tt-state-card" style={{ padding: 24 }}>
                      <p style={{ color: 'var(--tt-cream)', fontWeight: 700, margin: '0 0 6px' }}>Card payment is not ready.</p>
                      <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Use manual payment for now, or contact support for help.
                      </p>
                    </div>
                  ) : !stripeClientSecret ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                      {mutations.initiateMutation.isPending ? (
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
                      ) : null}
                      <p style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', margin: 0 }}>
                        {mutations.initiateMutation.isPending
                          ? 'Starting secure card checkout...'
                          : 'Ready to open the secure card form.'}
                      </p>
                      <button
                        type="button"
                        className="tt-btn-primary"
                        disabled={mutations.initiateMutation.isPending}
                        onClick={handleInitiateStripe}
                        style={{ marginTop: 18, padding: '12px 24px', borderRadius: 10, width: '100%', cursor: 'pointer' }}
                      >
                        {mutations.initiateMutation.isPending ? 'Starting...' : 'Pay With Card'}
                      </button>
                    </div>
                  ) : (
                    <StripePaymentWrapper
                      clientSecret={stripeClientSecret}
                      publishableKey={gateways?.stripe?.publishableKey}
                      onSuccess={showPaymentSuccess}
                      returnUrl={paymentReturnUrl}
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
                  {paypalAvailable ? (
                    <PaypalPaymentForm
                      paypalOrderId={paypalOrderId ?? undefined}
                      clientId={gateways?.paypal?.clientId}
                      onCreateOrder={handleInitiatePaypal}
                      onApproveOrder={handleCapturePaypal}
                    />
                  ) : (
                    <div className="tt-state-card" style={{ padding: 24 }}>
                      <p style={{ color: 'var(--tt-cream)', fontWeight: 700, margin: '0 0 6px' }}>PayPal is not ready.</p>
                      <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Use manual payment for now, or contact support for help.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Bank Transfer (Large Admin Instructions + Direct File Upload & Preview) */}
              {activeTab === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {!manualAvailable ? (
                    <div className="tt-state-card" style={{ padding: 24 }}>
                      <p style={{ color: 'var(--tt-cream)', fontWeight: 700, margin: '0 0 6px' }}>Manual payment is not configured.</p>
                      <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Please contact support for another way to pay.
                      </p>
                    </div>
                  ) : null}

                  {manualAvailable ? (
                    <>
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
                          {selectedMethod?.label ?? 'Manual Payment Details'}
                        </p>
                        <div style={{ color: 'var(--tt-cream)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                          {selectedMethod?.instructions ?? 'Manual payment details will be shown here when available.'}
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
                      Add a Payment Receipt
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)', marginBottom: 20 }}>
                      This is optional. If your bank does not allow screenshots, submit your payment details without one.
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
                        <span>Choose Receipt</span>
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
                        disabled={!selectedMethod || isUploading}
                        onClick={handleSubmitManualProof}
                        style={{
                          padding: '14px 28px',
                          borderRadius: 12,
                          cursor: !selectedMethod || isUploading ? 'not-allowed' : 'pointer',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          width: '100%',
                          opacity: !selectedMethod || isUploading ? 0.6 : 1
                        }}
                      >
                        {isUploading ? 'Submitting Payment...' : selectedFile ? 'Submit Payment with Receipt' : 'Submit Payment Details'}
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
          {pending && !isCompleted ? (
            <div className="tt-panel" style={{ padding: '24px 28px', borderRadius: 16 }}>
              <p style={{ fontWeight: 700, color: 'var(--tt-cream)', margin: '0 0 8px' }}>Payment received</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--tt-cream-muted)', margin: 0 }}>
                We saved your payment details. Your order history will show the final payment result shortly.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href={`/orders/${orderId}` as never}>View Order Details</Link>
                </Button>
                {!customer ? (
                  <Button asChild variant="secondary">
                    <Link href={`/signup?claimOrderId=${orderId}` as never}>Create Account</Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PaymentStatePanel({
  status,
  orderStatus,
  amount,
  orderId,
  provider
}: {
  status: string;
  orderStatus?: string | null;
  amount: string;
  orderId: string;
  provider: string | null;
}) {
  const state = getCustomerPaymentState(status, orderStatus);

  return (
    <Card className={state.tone === 'danger' ? 'border-[#e8304d] bg-[#241117]' : state.tone === 'success' ? 'border-emerald-500/40 bg-[#132019]' : 'border-[#342d32] bg-[#1f1d23]'}>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#f0c66d]">{state.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-black text-[#fff7e8]">{state.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#bca6a7]">{state.description}</p>
          </div>
          <Badge variant={state.tone === 'danger' ? 'red' : state.tone === 'success' ? 'green' : 'default'}>{state.badge}</Badge>
        </div>

        <div className="grid gap-2 rounded-lg bg-[#151319] p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8f7b7d]">Amount</p>
            <p className="mt-1 font-black text-[#fff7e8]">{amount}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8f7b7d]">Method</p>
            <p className="mt-1 font-black capitalize text-[#fff7e8]">{provider ?? 'Payment'}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8f7b7d]">Order</p>
            <p className="mt-1 font-black text-[#fff7e8]">#{orderId.slice(0, 8)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant={state.primaryVariant}>
            <Link href={state.primaryHref(orderId) as never}>{state.primaryLabel}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/orders/${orderId}` as never}>View Order</Link>
          </Button>
          {state.showContinue ? (
            <Button asChild variant="ghost">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function getCustomerPaymentState(status: string, orderStatus?: string | null): {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  tone: 'default' | 'success' | 'danger';
  primaryLabel: string;
  primaryVariant: 'default' | 'gold' | 'secondary' | 'ghost' | 'danger';
  primaryHref: (orderId: string) => string;
  showContinue: boolean;
} {
  const normalized = `${status} ${orderStatus ?? ''}`;

  if (normalized.includes('failed') || normalized.includes('cancelled') || normalized.includes('expired')) {
    return {
      eyebrow: 'Payment needs attention',
      title: 'We could not confirm this payment.',
      description: 'Please try again or contact support so we can help finish your order.',
      badge: 'Needs action',
      tone: 'danger',
      primaryLabel: 'Try Payment Again',
      primaryVariant: 'danger',
      primaryHref: (orderId) => `/payment?orderId=${orderId}`,
      showContinue: false
    };
  }

  if (normalized.includes('paid') || normalized.includes('approved') || normalized.includes('completed')) {
    return {
      eyebrow: 'Payment confirmed',
      title: 'Your order is confirmed.',
      description: 'Your payment is complete and your order can move into preparation and handoff.',
      badge: 'Confirmed',
      tone: 'success',
      primaryLabel: 'Track Order',
      primaryVariant: 'default',
      primaryHref: (orderId) => `/orders/${orderId}?track=1`,
      showContinue: true
    };
  }

  if (normalized.includes('manual') || normalized.includes('review')) {
    return {
      eyebrow: 'Payment submitted',
      title: 'Your payment is under review.',
      description: 'We have your payment details. Receipt upload is optional, and the order will update when payment is approved.',
      badge: 'Under review',
      tone: 'default',
      primaryLabel: 'Track Review',
      primaryVariant: 'gold',
      primaryHref: (orderId) => `/orders/${orderId}?track=1`,
      showContinue: true
    };
  }

  return {
    eyebrow: 'Payment step',
    title: 'Choose how you would like to pay.',
    description: 'Your order is held for a short window. Pick card, PayPal, or manual payment to continue.',
    badge: 'Waiting',
    tone: 'default',
    primaryLabel: 'View Order',
    primaryVariant: 'secondary',
    primaryHref: (orderId) => `/orders/${orderId}`,
    showContinue: false
  };
}
