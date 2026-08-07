'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { notifications } from '@mantine/notifications';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
const stripePromise = loadStripe(stripePublishableKey);

function StripeCheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/cart`
      },
      redirect: 'if_required'
    });

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Payment Error',
        message: error.message ?? 'An error occurred processing your payment.'
      });
      setSubmitting(false);
    } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      notifications.show({
        color: 'green',
        title: 'Payment Complete',
        message: 'Your order payment was processed successfully.'
      });
      onSuccess();
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaymentElement
        options={{
          layout: 'tabs'
        }}
      />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="tt-btn-primary"
        style={{
          padding: '12px 24px',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: '0.9rem',
          width: '100%',
          marginTop: 8,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {submitting ? (
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
            <span>Processing Card...</span>
          </>
        ) : (
          <>
            <span>Pay & Confirm Order</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

export function StripePaymentWrapper({
  clientSecret,
  onSuccess
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#B8933E',
            colorBackground: '#1E1E1E',
            colorText: '#FAF7F2',
            colorDanger: '#9B1B30',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px'
          }
        }
      }}
    >
      <StripeCheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
}
