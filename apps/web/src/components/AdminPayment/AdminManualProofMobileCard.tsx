import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';

export function AdminManualProofMobileCard({
  proof,
  onView,
  onApprove,
  onReject
}: {
  proof: AdminManualPaymentProofModel;
  onView: (proof: AdminManualPaymentProofModel) => void;
  onApprove: (proof: AdminManualPaymentProofModel) => void;
  onReject: (proof: AdminManualPaymentProofModel) => void;
}) {
  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <div>
          <Text fw={700}>{proof.customerName}</Text>
          <Text size="sm" c="dimmed">
            {proof.methodLabel} - ${(proof.amountCents / 100).toFixed(2)}
          </Text>
          <Text size="xs" c="dimmed">
            {proof.customerPhone || proof.customerEmail || 'No contact saved'}
          </Text>
        </div>
        <Group gap="xs">
          <Badge variant="light">{proof.paymentStatus.replaceAll('_', ' ')}</Badge>
          <Badge color={proof.reconciliationStatus === 'attention_required' ? 'red' : 'gray'} variant="light">
            {proof.reconciliationStatus.replaceAll('_', ' ')}
          </Badge>
        </Group>
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => onView(proof)}>
            View
          </Button>
          <Button size="xs" onClick={() => onApprove(proof)}>
            Approve
          </Button>
          <Button size="xs" color="red" variant="light" onClick={() => onReject(proof)}>
            Reject
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
