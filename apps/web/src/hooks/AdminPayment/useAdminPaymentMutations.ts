'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManualPaymentProofQueryKey } from '@/constants/AdminPayment/adminPaymentConstants';
import { approveManualProof, rejectManualProof } from '@/services/AdminPayment/adminPaymentApi';

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useAdminPaymentMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminManualPaymentProofQueryKey });

  const approveMutation = useMutation({
    mutationFn: approveManualProof,
    onSuccess: async () => {
      await invalidate();
      notifications.show({ color: 'green', title: 'Done', message: 'Payment approved.' });
      onDone();
    },
    onError: (error) => fail(error, 'Could not approve proof.')
  });

  const rejectMutation = useMutation({
    mutationFn: (input: { proofId: string; reason: string }) => rejectManualProof(input.proofId, input.reason),
    onSuccess: async () => {
      await invalidate();
      notifications.show({ color: 'green', title: 'Done', message: 'Payment rejected.' });
      onDone();
    },
    onError: (error) => fail(error, 'Could not reject proof.')
  });

  return { approveMutation, rejectMutation };
}
