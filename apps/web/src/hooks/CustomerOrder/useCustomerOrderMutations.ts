'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerOrdersQueryKey } from '@/constants/CustomerOrder/customerOrderConstants';
import { completeCustomerOrder } from '@/services/CustomerOrder/customerOrderApi';

export function useCustomerOrderMutations(onDone: () => void) {
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: completeCustomerOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerOrdersQueryKey });
      notifications.show({ color: 'green', title: 'Done', message: 'Order completed.' });
      onDone();
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Action failed',
        message: error instanceof Error ? error.message : 'Could not complete order.'
      });
    }
  });

  return { completeMutation };
}
