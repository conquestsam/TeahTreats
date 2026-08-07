'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPromotionQueryKey } from '@/constants/AdminPromotion/adminPromotionConstants';
import {
  archiveAdminPromotion,
  createAdminPromotion,
  updateAdminPromotion
} from '@/services/AdminPromotion/adminPromotionApi';
import type { AdminPromotionInput } from '@/types/AdminPromotion/adminPromotionTypes';

function success(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function fail(message: string) {
  notifications.show({ color: 'red', title: 'Action failed', message });
}

export function useAdminPromotionMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminPromotionQueryKey });

  const createPromotionMutation = useMutation({
    mutationFn: (input: AdminPromotionInput) => createAdminPromotion(input),
    onSuccess: async () => {
      await invalidate();
      success('Promotion created.');
      onDone();
    },
    onError: () => fail('Could not create promotion.')
  });

  const updatePromotionMutation = useMutation({
    mutationFn: (payload: { promotionId: string; input: Partial<AdminPromotionInput> }) =>
      updateAdminPromotion(payload.promotionId, payload.input),
    onSuccess: async () => {
      await invalidate();
      success('Promotion saved.');
      onDone();
    },
    onError: () => fail('Could not save promotion.')
  });

  const archivePromotionMutation = useMutation({
    mutationFn: archiveAdminPromotion,
    onSuccess: async () => {
      await invalidate();
      success('Promotion archived.');
      onDone();
    },
    onError: () => fail('Could not archive promotion.')
  });

  return {
    createPromotionMutation,
    updatePromotionMutation,
    archivePromotionMutation
  };
}
