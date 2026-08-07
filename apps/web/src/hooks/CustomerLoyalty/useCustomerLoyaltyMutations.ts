'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerLoyaltyQueryKey } from '@/constants/CustomerLoyalty/customerLoyaltyConstants';
import { claimCustomerQuest } from '@/services/CustomerLoyalty/customerLoyaltyApi';

export function useCustomerLoyaltyMutations() {
  const queryClient = useQueryClient();
  return {
    claimMutation: useMutation({
      mutationFn: claimCustomerQuest,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: customerLoyaltyQueryKey });
        notifications.show({ color: 'green', title: 'Done', message: 'Reward claimed.' });
      },
      onError: (error) =>
        notifications.show({
          color: 'red',
          title: 'Action failed',
          message: error instanceof Error ? error.message : 'Could not claim reward.'
        })
    })
  };
}
