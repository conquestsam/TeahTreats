'use client';

import { Badge, Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';
import type { RejectManualPaymentFormValues } from '@/validation/AdminPayment/adminPaymentValidation';

export function AdminProofViewModal({
  opened,
  proof,
  onClose
}: {
  opened: boolean;
  proof: AdminManualPaymentProofModel | null;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Payment Proof" centered>
      {proof ? (
        <Stack>
          <Text fw={700}>{proof.customerName}</Text>
          <Text size="sm">Order: {proof.orderId}</Text>
          <Group gap="xs">
            <Badge variant="light">{proof.paymentStatus.replaceAll('_', ' ')}</Badge>
            <Badge color={proof.reconciliationStatus === 'attention_required' ? 'red' : 'gray'} variant="light">
              {proof.reconciliationStatus.replaceAll('_', ' ')}
            </Badge>
          </Group>
          <Text size="sm">Order status: {proof.orderStatus.replaceAll('_', ' ')}</Text>
          <Text size="sm">Last event: {proof.lastProviderEventId ?? 'None yet'}</Text>
          <Text size="sm">Receipt: {proof.receiptUrl}</Text>
          <Text size="sm">Note: {proof.note ?? 'No note'}</Text>
          <Button component="a" href={proof.receiptUrl} target="_blank" rel="noreferrer">
            Open Receipt
          </Button>
        </Stack>
      ) : null}
    </Modal>
  );
}

export function AdminProofApproveModal({
  opened,
  loading,
  proof,
  onClose,
  onConfirm
}: {
  opened: boolean;
  loading: boolean;
  proof: AdminManualPaymentProofModel | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Approve Payment" centered>
      <Stack>
        <Text size="sm">Approve payment for {proof?.customerName ?? 'this customer'}?</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={onConfirm}>
            Approve
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function AdminProofRejectModal({
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: {
  opened: boolean;
  loading: boolean;
  form: UseFormReturnType<RejectManualPaymentFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Reject Payment" centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Textarea label="Reason" withAsterisk {...form.getInputProps('reason')} />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button color="red" type="submit" loading={loading}>
              Reject
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
