'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupCartQueryKey } from '@/constants/GroupCart/groupCartConstants';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import { addGroupCartItem, createGroupCart, mergeGroupCart } from '@/services/GroupCart/groupCartApi';
import type { AddGroupCartItemInput } from '@/types/GroupCart/groupCartTypes';

export function useGroupCartMutations(onDone?: () => void) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: groupCartQueryKey });
    await queryClient.invalidateQueries({ queryKey: customerCartQueryKey });
  };

  return {
    createMutation: useMutation({
      mutationFn: createGroupCart,
      onSuccess: async () => {
        await invalidate();
        notifications.show({ color: 'green', title: 'Done', message: 'Group cart created.' });
      },
      onError: () => notifications.show({ color: 'red', title: 'Action failed', message: 'Could not create group cart.' })
    }),
    addItemMutation: useMutation({
      mutationFn: (payload: { groupCartId: string; input: AddGroupCartItemInput }) =>
        addGroupCartItem(payload.groupCartId, payload.input),
      onSuccess: async () => {
        await invalidate();
        notifications.show({ color: 'green', title: 'Done', message: 'Item added to group cart.' });
      },
      onError: () => notifications.show({ color: 'red', title: 'Action failed', message: 'Could not add item.' })
    }),
    mergeMutation: useMutation({
      mutationFn: mergeGroupCart,
      onSuccess: async () => {
        await invalidate();
        notifications.show({ color: 'green', title: 'Done', message: 'Group cart copied to cart.' });
        onDone?.();
      },
      onError: () => notifications.show({ color: 'red', title: 'Action failed', message: 'Could not copy group cart.' })
    })
  };
}
