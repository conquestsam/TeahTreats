import { Badge, Button, Group, Paper, Table, Text } from '@mantine/core';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';
import { formatMoney } from '@/lib/formatters/money';

interface AdminManualProofTableProps {
  proofs: AdminManualPaymentProofModel[];
  onView: (proof: AdminManualPaymentProofModel) => void;
  onApprove: (proof: AdminManualPaymentProofModel) => void;
  onReject: (proof: AdminManualPaymentProofModel) => void;
}

export function AdminManualProofTable({ proofs, onView, onApprove, onReject }: AdminManualProofTableProps) {
  return (
    <>
      <div className="admin-mobile-card-list">
        {proofs.map((proof) => (
          <article key={proof.id} className="admin-mobile-order-card">
            <div className="admin-mobile-card-topline">
              <div>
                <Text fw={900} className="admin-mobile-card-ref">#{proof.shortOrderRef}</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>{relativeTime(proof.createdAt)}</Text>
              </div>
              <div className="text-right">
                <Text fw={950} className="admin-mobile-card-total">{formatMoney(proof.amountCents, proof.currency)}</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>{proof.methodLabel}</Text>
              </div>
            </div>

            <Group gap="xs">
              <span className="admin-mobile-pill admin-mobile-pill-alert">{proof.reviewStatusLabel}</span>
              <span className="admin-mobile-pill">{proof.reconciliationStatusLabel}</span>
            </Group>

            <div className="admin-mobile-card-customer">
              <div>
                <Text fw={850}>{proof.customerName || 'Customer'}</Text>
                <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>{proof.customerSummary || proof.customerEmail || 'No contact added'}</Text>
              </div>
              {proof.customerPhone ? (
                <a className="admin-mobile-icon-action" href={`tel:${proof.customerPhone}`} aria-label={`Call ${proof.customerName || 'customer'}`}>
                  ☎
                </a>
              ) : null}
            </div>

            <div className="admin-mobile-payment-route">
              <div>
                <Text size="xs" fw={900} tt="uppercase">Amount due</Text>
                <Text fw={950}>{formatMoney(proof.amountCents, proof.currency)}</Text>
              </div>
              <div>
                <Text size="xs" fw={900} tt="uppercase">Method</Text>
                <Text fw={850}>{proof.methodLabel}</Text>
              </div>
            </div>

            <div className="admin-mobile-card-summary">
              <ItemPreviewThumb imageUrl={proof.items[0]?.imageUrl ?? null} />
              <div>
                <Text fw={850} className="admin-mobile-card-item-title">{formatProofItems(proof)}</Text>
                <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
                  Order total {formatMoney(proof.orderTotalCents, proof.currency)}
                </Text>
              </div>
            </div>

            <button type="button" className="admin-mobile-proof-preview" onClick={() => onView(proof)}>
              <span className="admin-mobile-proof-thumb">
                {proof.receiptUrl ? (
                  <img src={proof.receiptUrl} alt={`Receipt for ${proof.customerName || 'customer'}`} />
                ) : (
                  <span>No image</span>
                )}
              </span>
              <span>
                <strong>{proof.receiptUrl ? 'Receipt attached' : 'No receipt attached'}</strong>
                <small>{proof.receiptReference}</small>
              </span>
            </button>

            <div className="admin-mobile-card-actions">
              <Button fullWidth onClick={() => onApprove(proof)}>
                Approve
              </Button>
              <Button fullWidth color="red" variant="light" onClick={() => onReject(proof)}>
                Reject
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Paper withBorder className="enterprise-panel overflow-hidden admin-desktop-table">
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
                <Table.Td>{formatMoney(proof.amountCents, proof.currency)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                <Badge variant="light">{proof.paymentStatusLabel}</Badge>
                <Badge color={proof.reconciliationStatus === 'attention_required' ? 'red' : 'gray'} variant="light">
                      {proof.reconciliationStatusLabel}
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
    </>
  );
}

function ItemPreviewThumb({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <span className="admin-mobile-item-thumb">
        <img src={imageUrl} alt="" />
      </span>
    );
  }

  return <span className="admin-mobile-item-icon">▤</span>;
}

function formatProofItems(proof: AdminManualPaymentProofModel) {
  if (!proof.items.length) {
    return 'Order items attached';
  }

  const preview = proof.items
    .slice(0, 2)
    .map((item) => `${item.quantity}x ${item.productName}${item.skuName ? ` (${item.skuName})` : ''}`)
    .join(', ');
  const remaining = proof.items.slice(2).reduce((sum, item) => sum + item.quantity, 0);

  return remaining > 0 ? `${preview}, +${remaining} more` : preview;
}

function relativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  return new Date(value).toLocaleDateString();
}
