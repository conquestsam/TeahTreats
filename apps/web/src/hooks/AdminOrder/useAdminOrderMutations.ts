'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrdersQueryKey } from '@/constants/AdminOrder/adminOrderConstants';
import {
  cancelAdminOrder,
  completeAdminOrder,
  prepareAdminOrder,
  readyAdminOrder
} from '@/services/AdminOrder/adminOrderApi';

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useAdminOrderMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });

  const prepareMutation = useMutation({
    mutationFn: prepareAdminOrder,
    onSuccess: async () => {
      await invalidate();
      notifications.show({ color: 'green', title: 'Done', message: 'Order is preparing.' });
      onDone();
    },
    onError: (error) => fail(error, 'Could not update order.')
  });

  const readyMutation = useMutation({
    mutationFn: readyAdminOrder,
    onSuccess: async () => {
      await invalidate();
      notifications.show({ color: 'green', title: 'Done', message: 'Customer readiness notice was queued.' });
      onDone();
    },
    onError: (error) => fail(error, 'Could not mark order ready.')
  });

  const completeMutation = useMutation({
    mutationFn: completeAdminOrder,
    onSuccess: async () => {
      await invalidate();
      notifications.show({ color: 'green', title: 'Done', message: 'Order completed.' });
      onDone();
    },
    onError: (error) => fail(error, 'Could not complete order.')
  });

  const cancelMutation = useMutation({
    mutationFn: (input: { orderId: string; reason: string }) => cancelAdminOrder(input.orderId, input.reason),
    onSuccess: async () => {
      await invalidate();
      notifications.show({ color: 'green', title: 'Done', message: 'Order cancelled.' });
      onDone();
    },
    onError: (error) => fail(error, 'Could not cancel order.')
  });

  return { prepareMutation, readyMutation, completeMutation, cancelMutation };
}
