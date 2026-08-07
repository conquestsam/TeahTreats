'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { notifications } from '@mantine/notifications';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

interface PaypalPaymentFormProps {
  paypalOrderId?: string | undefined;
  onCreateOrder: () => Promise<string>;
  onSuccess: () => void;
}

export function PaypalPaymentForm({ paypalOrderId, onCreateOrder, onSuccess }: PaypalPaymentFormProps) {
  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD' }}>
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
              notifications.show({
                color: 'red',
                title: 'PayPal Error',
                message: 'Could not create PayPal checkout order.'
              });
              throw err;
            }
          }}
          onApprove={async (_data, actions) => {
            if (actions.order) {
              await actions.order.capture();
            }
            notifications.show({
              color: 'green',
              title: 'PayPal Order Approved',
              message: 'Your payment was processed successfully.'
            });
            onSuccess();
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
