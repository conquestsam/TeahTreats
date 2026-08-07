'use client';

import { notifications } from '@mantine/notifications';
import { realtimeEventTypes } from '@snacks/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { adminInventoryBatchQueryKey, adminInventorySkuQueryKey } from '@/constants/AdminInventory/adminInventoryConstants';
import { adminOrdersQueryKey } from '@/constants/AdminOrder/adminOrderConstants';
import { adminManualPaymentProofQueryKey } from '@/constants/AdminPayment/adminPaymentConstants';
import { adminProductQueryKey } from '@/constants/AdminProduct/adminProductConstants';
import { connectAdminRealtime } from '@/services/Realtime/realtimeApi';

export function useAdminRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return connectAdminRealtime((event) => {
      if (event.type === 'heartbeat') {
        return;
      }

      if (event.type === realtimeEventTypes.orderStatusChanged || event.type === realtimeEventTypes.orderReady) {
        void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
        notifications.show({
          color: event.type === realtimeEventTypes.orderReady ? 'teal' : 'blue',
          title: event.type === realtimeEventTypes.orderReady ? 'Order ready' : 'Order updated',
          message: 'Order information has been refreshed.'
        });
      }

      if (
        event.type === realtimeEventTypes.paymentProofSubmitted ||
        event.type === realtimeEventTypes.paymentProofReviewed
      ) {
        void queryClient.invalidateQueries({ queryKey: adminManualPaymentProofQueryKey });
        notifications.show({
          color: 'yellow',
          title: event.type === realtimeEventTypes.paymentProofSubmitted ? 'New payment proof' : 'Payment updated',
          message: 'Manual payment information has been refreshed.'
        });
      }

      if (event.type === realtimeEventTypes.inventoryChanged) {
        void queryClient.invalidateQueries({ queryKey: adminInventoryBatchQueryKey });
        void queryClient.invalidateQueries({ queryKey: adminInventorySkuQueryKey });
      }

      if (event.type === realtimeEventTypes.productChanged) {
        void queryClient.invalidateQueries({ queryKey: adminProductQueryKey });
      }
    });
  }, [enabled, queryClient]);
}
