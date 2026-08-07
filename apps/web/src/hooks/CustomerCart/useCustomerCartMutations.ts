'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import {
  removeCustomerCartItem,
  startCustomerCheckout,
  updateCustomerCartItem,
  validateCustomerCoupon
} from '@/services/CustomerCart/customerCartApi';
import type { CheckoutCustomerInput } from '@/types/CustomerCart/customerCartTypes';

function success(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useCustomerCartMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: customerCartQueryKey });

  const updateQuantityMutation = useMutation({
    mutationFn: (input: { itemId: string; quantity: number }) =>
      updateCustomerCartItem(input.itemId, input.quantity),
    onSuccess: async () => {
      await invalidate();
    },
    onError: (error) => fail(error, 'Could not update quantity.')
  });

  const removeMutation = useMutation({
    mutationFn: removeCustomerCartItem,
    onSuccess: async () => {
      await invalidate();
      success('Item removed.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not remove item.')
  });

  const checkoutMutation = useMutation({
    mutationFn: (input: CheckoutCustomerInput) => startCustomerCheckout(input),
    onSuccess: async () => {
      await invalidate();
      success('Stock reserved. Payment comes next.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not start checkout.')
  });

  const couponMutation = useMutation({
    mutationFn: (input: { code: string; email?: string }) => validateCustomerCoupon(input),
    onSuccess: (preview) => {
      if (preview.valid) {
        success('Coupon applied.');
      } else {
        fail(new Error(preview.message), 'Coupon could not be applied.');
      }
    },
    onError: (error) => fail(error, 'Could not check coupon.')
  });

  return { updateQuantityMutation, removeMutation, checkoutMutation, couponMutation };
}
