'use client';

import { notifications } from '@mantine/notifications';
import { realtimeEventTypes } from '@snacks/shared';
import { useEffect } from 'react';
import { connectCustomerOrderRealtime, verifyCustomerOrderStream } from '@/services/Realtime/realtimeApi';

export function useCustomerOrderRealtime(input: { orderId: string; email: string; phone: string; enabled: boolean }) {
  useEffect(() => {
    if (!input.enabled || !input.orderId || !input.email || !input.phone) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void verifyCustomerOrderStream({
      orderId: input.orderId,
      email: input.email,
      phone: input.phone
    }).then(() => {
      if (cancelled) {
        return;
      }

      cleanup = connectCustomerOrderRealtime(
        {
          orderId: input.orderId,
          email: input.email,
          phone: input.phone
        },
        (event) => {
          if (event.type === 'heartbeat') {
            return;
          }
          if (event.type === realtimeEventTypes.orderReady) {
            notifications.show({
              color: 'teal',
              title: 'Order ready',
              message: 'Your snacks are ready.'
            });
          }
          if (event.type === realtimeEventTypes.orderStatusChanged) {
            notifications.show({
              color: 'blue',
              title: 'Order updated',
              message: 'Your order status changed.'
            });
          }
        },
      );
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [input.email, input.enabled, input.orderId, input.phone]);
}
