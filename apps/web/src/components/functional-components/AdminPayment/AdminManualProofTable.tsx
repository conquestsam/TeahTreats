import { Badge, Button, Group, Paper, Table, Text } from '@mantine/core';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';

interface AdminManualProofTableProps {
  proofs: AdminManualPaymentProofModel[];
  onView: (proof: AdminManualPaymentProofModel) => void;
  onApprove: (proof: AdminManualPaymentProofModel) => void;
  onReject: (proof: AdminManualPaymentProofModel) => void;
}

export function AdminManualProofTable({ proofs, onView, onApprove, onReject }: AdminManualProofTableProps) {
  return (
    <Paper withBorder className="enterprise-panel overflow-hidden">
      <Table.ScrollContainer minWidth={860}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Method</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {proofs.map((proof) => (
              <Table.Tr key={proof.id}>
                <Table.Td>
                  <Text fw={700}>{proof.customerName}</Text>
                  <Text size="sm" c="dimmed">
                    {proof.customerEmail}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {proof.customerPhone || 'No phone'}
                  </Text>
                </Table.Td>
                <Table.Td>{proof.methodLabel}</Table.Td>
                <Table.Td>${(proof.amountCents / 100).toFixed(2)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Badge variant="light">{proof.paymentStatus.replaceAll('_', ' ')}</Badge>
                    <Badge color={proof.reconciliationStatus === 'attention_required' ? 'red' : 'gray'} variant="light">
                      {proof.reconciliationStatus.replaceAll('_', ' ')}
                    </Badge>
                  </Group>
                </Table.Td>
                <Table.Td>{new Date(proof.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => onView(proof)}>
                      View Proof
                    </Button>
                    <Button size="xs" onClick={() => onApprove(proof)}>
                      Approve
                    </Button>
                    <Button size="xs" color="red" variant="light" onClick={() => onReject(proof)}>
                      Reject
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
