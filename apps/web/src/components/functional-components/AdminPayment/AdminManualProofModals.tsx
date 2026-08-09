'use client';

import { Anchor, Badge, Button, Divider, Group, Modal, Paper, ScrollArea, SimpleGrid, Stack, Table, Text, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';
import type { RejectManualPaymentFormValues } from '@/validation/AdminPayment/adminPaymentValidation';

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(cents / 100);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not set';
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

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
    <Modal opened={opened} onClose={onClose} title="Payment Proof" size="xl" centered>
      {proof ? (
        <ScrollArea.Autosize mah="calc(100vh - 180px)" offsetScrollbars>
          <Stack gap="lg" pr="sm">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Paper withBorder radius="md" p="md" className="enterprise-panel">
                <Stack gap="sm">
                  <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                    Receipt image
                  </Text>
                  <div className="admin-proof-receipt-frame">
                    <img src={proof.receiptUrl} alt={`Receipt for order ${proof.orderId}`} className="admin-proof-receipt-image" />
                  </div>
                  <Group gap="xs">
                    <Button component="a" href={proof.receiptUrl} target="_blank" rel="noreferrer" variant="light">
                      Open Receipt
                    </Button>
                    <Button component="a" href={`/admin/orders?orderId=${proof.orderId}`} variant="subtle">
                      Open Order
                    </Button>
                  </Group>
                </Stack>
              </Paper>

              <Paper withBorder radius="md" p="md" className="enterprise-panel">
                <Stack gap="sm">
                  <div>
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Customer
                    </Text>
                    <Text fw={800} size="lg">
                      {proof.customerName}
                    </Text>
                  </div>
                  <Stack gap={4}>
                    <Text size="sm">
                      Email: {proof.customerEmail ? <Anchor href={`mailto:${proof.customerEmail}`}>{proof.customerEmail}</Anchor> : 'Not provided'}
                    </Text>
                    <Text size="sm">
                      Phone: {proof.customerPhone ? <Anchor href={`tel:${proof.customerPhone}`}>{proof.customerPhone}</Anchor> : 'Not provided'}
                    </Text>
                    <Text size="sm">Address: {proof.customerAddress || 'Not provided'}</Text>
                  </Stack>
                  <Divider />
                  <Group gap="xs">
                    <Badge variant="light">{proof.paymentStatus.replaceAll('_', ' ')}</Badge>
                    <Badge color={proof.orderStatus === 'paid' ? 'green' : 'yellow'} variant="light">
                      Order: {proof.orderStatus.replaceAll('_', ' ')}
                    </Badge>
                    <Badge color={proof.reconciliationStatus === 'attention_required' ? 'red' : 'gray'} variant="light">
                      {proof.reconciliationStatus.replaceAll('_', ' ')}
                    </Badge>
                  </Group>
                  <Text size="sm">Submitted: {formatDateTime(proof.createdAt)}</Text>
                  <Text size="sm">Last event: {proof.lastProviderEventId ?? 'None yet'}</Text>
                  <Text size="sm">Reservation expires: {formatDateTime(proof.reservationExpiresAt)}</Text>
                  <Text size="sm">Note: {proof.note ?? 'No note'}</Text>
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="md" p="md" className="enterprise-panel">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" tt="uppercase" fw={800} c="dimmed">
                      Order details
                    </Text>
                    <Text fw={800}>{proof.orderId}</Text>
                    <Text size="sm" c="dimmed">
                      Created {formatDateTime(proof.orderCreatedAt)}
                    </Text>
                  </div>
                  <Stack gap={2} align="flex-end">
                    <Text size="sm">Subtotal: {formatMoney(proof.orderSubtotalCents, proof.currency)}</Text>
                    <Text size="sm">Discount: {formatMoney(proof.orderDiscountCents, proof.currency)}</Text>
                    <Text fw={800}>Total: {formatMoney(proof.orderTotalCents, proof.currency)}</Text>
                  </Stack>
                </Group>
                <Table.ScrollContainer minWidth={620}>
                  <Table verticalSpacing="sm" className="admin-unified-table">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>SKU</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Unit</Table.Th>
                        <Table.Th>Total</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {proof.items.map((item) => (
                        <Table.Tr key={`${item.productName}-${item.skuName}`}>
                          <Table.Td>{item.productName}</Table.Td>
                          <Table.Td>{item.skuName}</Table.Td>
                          <Table.Td>{item.quantity}</Table.Td>
                          <Table.Td>{formatMoney(item.unitPriceCents, proof.currency)}</Table.Td>
                          <Table.Td>{formatMoney(item.lineTotalCents, proof.currency)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Stack>
            </Paper>
          </Stack>
        </ScrollArea.Autosize>
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
