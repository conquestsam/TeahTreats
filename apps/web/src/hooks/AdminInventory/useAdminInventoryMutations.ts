'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminInventoryBatchQueryKey } from '@/constants/AdminInventory/adminInventoryConstants';
import {
  adjustInventoryBatch,
  createInventoryBatch,
  expireInventoryBatch,
  updateInventoryBatchExpiry
} from '@/services/AdminInventory/adminInventoryApi';
import type {
  AdjustInventoryBatchInput,
  CreateInventoryBatchInput,
  UpdateInventoryBatchExpiryInput
} from '@/types/AdminInventory/adminInventoryTypes';

function notifySuccess(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function notifyError(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useAdminInventoryMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminInventoryBatchQueryKey });

  const createMutation = useMutation({
    mutationFn: (input: CreateInventoryBatchInput) => createInventoryBatch(input),
    onSuccess: async () => {
      await invalidate();
      notifySuccess('Batch created.');
      onDone();
    },
    onError: (error) => notifyError(error, 'Could not create batch.')
  });

  const adjustMutation = useMutation({
    mutationFn: (input: { batchId: string; adjustment: AdjustInventoryBatchInput }) =>
      adjustInventoryBatch(input.batchId, input.adjustment),
    onSuccess: async () => {
      await invalidate();
      notifySuccess('Stock adjusted.');
      onDone();
    },
    onError: (error) => notifyError(error, 'Could not adjust stock.')
  });

  const expireMutation = useMutation({
    mutationFn: expireInventoryBatch,
    onSuccess: async () => {
      await invalidate();
      notifySuccess('Batch expired.');
      onDone();
    },
    onError: (error) => notifyError(error, 'Could not expire batch.')
  });

  const updateExpiryMutation = useMutation({
    mutationFn: (input: { batchId: string; expiry: UpdateInventoryBatchExpiryInput }) =>
      updateInventoryBatchExpiry(input.batchId, input.expiry),
    onSuccess: async () => {
      await invalidate();
      notifySuccess('Batch expiry updated.');
      onDone();
    },
    onError: (error) => notifyError(error, 'Could not update batch expiry.')
  });

  return { createMutation, adjustMutation, expireMutation, updateExpiryMutation };
}
