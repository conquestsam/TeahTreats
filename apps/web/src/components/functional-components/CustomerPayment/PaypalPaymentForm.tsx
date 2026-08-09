'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { notifications } from '@mantine/notifications';

interface PaypalPaymentFormProps {
  paypalOrderId?: string | undefined;
  clientId?: string | null | undefined;
  onCreateOrder: () => Promise<string>;
  onApproveOrder: (paypalOrderId: string) => Promise<void>;
}

export function PaypalPaymentForm({ paypalOrderId, clientId, onCreateOrder, onApproveOrder }: PaypalPaymentFormProps) {
  if (!clientId) {
    return (
      <div className="tt-state-card" style={{ padding: 24 }}>
        <p style={{ color: 'var(--tt-cream)', fontWeight: 700, margin: '0 0 6px' }}>PayPal buttons are not ready.</p>
        <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.85rem', margin: 0 }}>
          PayPal is enabled on the server, but this in-browser PayPal button has not been configured for the current environment.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'USD' }}>
      <div style={{ marginTop: 8 }}>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
          }}
          createOrder={async () => {
            if (paypalOrderId) return paypalOrderId;
            try {
              const orderId = await onCreateOrder();
              return orderId;
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Could not create PayPal checkout order.';
              notifications.show({
                color: 'red',
                title: 'PayPal Error',
                message
              });
              throw err;
            }
          }}
          onApprove={async (data) => {
            if (!data.orderID) {
              throw new Error('PayPal did not return an approved order ID.');
            }
            await onApproveOrder(data.orderID);
            notifications.show({
              color: 'green',
              title: 'PayPal Payment Captured',
              message: 'Your payment was captured and is being confirmed.'
            });
          }}
          onError={(err) => {
            notifications.show({
              color: 'red',
              title: 'Payment Cancelled or Failed',
              message: err.toString() || 'PayPal checkout encountered an issue.'
            });
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
