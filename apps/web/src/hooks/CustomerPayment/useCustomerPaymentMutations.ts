'use client';

import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import {
  createReceiptUpload,
  initiateManualPayment,
  initiatePayment,
  submitManualPaymentProof
} from '@/services/CustomerPayment/customerPaymentApi';
import type {
  CustomerPaymentVerificationInput,
  SubmitManualProofInput
} from '@/types/CustomerPayment/customerPaymentTypes';

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useCustomerPaymentMutations(onProofSubmitted: () => void) {
  const initiateMutation = useMutation({
    mutationFn: (input: CustomerPaymentVerificationInput & { provider: 'stripe' | 'paypal' | 'manual' }) =>
      initiatePayment(input),
    onError: (error) => fail(error, 'Could not start payment.')
  });

  const uploadMutation = useMutation({
    mutationFn: (input: CustomerPaymentVerificationInput & { contentType: string }) =>
      createReceiptUpload(input),
    onError: (error) => fail(error, 'Could not create upload link.')
  });

  const proofMutation = useMutation({
    mutationFn: (input: SubmitManualProofInput) => submitManualPaymentProof(input),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Receipt submitted',
        message: 'Your payment is waiting for review.'
      });
      onProofSubmitted();
    },
    onError: (error) => fail(error, 'Could not submit receipt.')
  });

  return { initiateMutation, uploadMutation, proofMutation };
}
