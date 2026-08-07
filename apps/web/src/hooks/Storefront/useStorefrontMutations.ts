'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import { addStorefrontItemToCart } from '@/services/Storefront/storefrontApi';
import type { StorefrontAddToCartInput } from '@/types/Storefront/storefrontTypes';

export function useStorefrontAddToCartMutation(onDone: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StorefrontAddToCartInput) => addStorefrontItemToCart(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerCartQueryKey });
      notifications.show({
        color: 'green',
        title: 'Added',
        message: 'Snack added to cart.'
      });
      onDone();
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Could not add snack',
        message: error instanceof Error ? error.message : 'Try again.'
      });
    }
  });
}
