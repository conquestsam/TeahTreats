'use client';

import { useMemo, useState } from 'react';
import { Button, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';

import {
  AdminProofApproveModal,
  AdminProofRejectModal,
  AdminProofViewModal
} from '@/components/AdminPayment/AdminManualProofModals';
import { AdminManualProofTable } from '@/components/AdminPayment/AdminManualProofTable';
import { useRejectManualPaymentForm } from '@/hooks/AdminPayment/useAdminPaymentForm';
import { useAdminPaymentModals } from '@/hooks/AdminPayment/useAdminPaymentModals';
import { useAdminPaymentMutations } from '@/hooks/AdminPayment/useAdminPaymentMutations';
import { useManualPaymentProofQuery } from '@/hooks/AdminPayment/useAdminPaymentQuery';
import type { AdminManualPaymentProofModel } from '@/types/AdminPayment/adminPaymentTypes';
import { formatMoney } from '@/lib/formatters/money';
import { AppPageHeader } from '@/components/ui/app-page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';

export function AdminManualPaymentContent() {
  const proofsQuery = useManualPaymentProofQuery();
  const modals = useAdminPaymentModals();
  const rejectForm = useRejectManualPaymentForm();
  const mutations = useAdminPaymentMutations(() => {
    rejectForm.reset();
    modals.closeModal();
  });
  const proofs = proofsQuery.data ?? [];
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCount = proofs.length;
  const totalAmountCents = proofs.reduce((sum, proof) => sum + proof.amountCents, 0);
  const currency = proofs[0]?.currency ?? 'USD';
  const noUploadCount = proofs.filter((proof) => !proof.receiptUrl).length;
  const exactMatchCount = proofs.filter((proof) => proof.reconciliationStatus !== 'attention_required').length;
  const filteredProofs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return proofs;
    }

    return proofs.filter((proof) =>
      [
        proof.id,
        proof.orderId,
        proof.customerName,
        proof.customerEmail,
        proof.customerPhone,
        proof.methodLabel,
        proof.reconciliationStatus
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [proofs, searchTerm]);

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <div className="admin-desktop-page-header">
          <AppPageHeader
            eyebrow="Payment review"
            title="Manual Payments"
            description="Review customer receipts before releasing orders to the kitchen."
            badge={`${pendingCount} pending`}
          />
        </div>

        <section className="admin-mobile-workflow-header">
          <div className="admin-mobile-brand-row">
            <div>
              <Text fw={950} className="admin-mobile-brand-title">TeshTreats <span>Admin</span></Text>
              <Text className="admin-mobile-live-dot">Kitchen live</Text>
            </div>
            <Group gap="xs" wrap="nowrap">
              <span className="admin-mobile-alert-badge">{pendingCount}</span>
              <span className="admin-mobile-avatar">A</span>
            </Group>
          </div>
          <Group justify="space-between" align="end" gap="md" wrap="nowrap">
            <div>
              <Text fw={900} className="admin-mobile-page-title">Transfers</Text>
              <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Review payment details before releasing orders to the kitchen.</Text>
            </div>
            <span className="admin-mobile-vault-chip">Queue</span>
          </Group>
        </section>

        <section className="admin-payment-compliance-card">
          <span>✓</span>
          <div>
            <Text size="xs" fw={900} tt="uppercase" style={{ color: '#ffd98a' }}>US Banking Ready</Text>
            <Text size="sm">Receipt uploads are optional. Review the reference, payer name, bank, and USD amount.</Text>
          </div>
        </section>

        <section className="admin-mobile-summary-card">
          <span className="admin-mobile-summary-icon">▤</span>
          <div>
            <Text size="xs" fw={900} tt="uppercase" style={{ color: '#ffd98a', letterSpacing: '0.08em' }}>Queue summary</Text>
            <Text fw={950}>{pendingCount} Payments Awaiting</Text>
            <Text fw={950} className="admin-mobile-card-total">{formatMoney(totalAmountCents, currency)} Total</Text>
          </div>
        </section>

        <SimpleGrid cols={{ base: 3, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics admin-payment-metrics">
          <MetricCard label="Pending payments" value={pendingCount} hint="Needs review" tone="orange" />
          <MetricCard label="Total amount" value={formatMoney(totalAmountCents, currency)} hint="Awaiting approval" tone="green" />
          <MetricCard label="Exact matches" value={exactMatchCount} hint="Ready to approve" tone="blue" />
          <MetricCard label="No upload" value={noUploadCount} hint="Allowed" tone="gray" />
        </SimpleGrid>

        <div className="admin-mobile-queue-tools">
          <TextInput
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            placeholder="Search customer, order, phone..."
            aria-label="Search payments"
          />
          <Group justify="space-between" wrap="nowrap" className="admin-mobile-section-label">
            <Text size="xs" fw={900} tt="uppercase">Verification queue ({filteredProofs.length})</Text>
            <Button size="xs" variant="subtle" onClick={() => proofsQuery.refetch()}>
              Refresh Queue
            </Button>
          </Group>
        </div>

        {proofsQuery.isLoading ? (
          <StateCard loading title="Loading payments..." description="Checking customer payment details." />
        ) : filteredProofs.length === 0 ? (
          <StateCard title="No pending payments." description="New payment submissions will appear here for review." tone="success" />
        ) : (
          <div className="admin-payment-review-workspace">
              <AdminManualProofTable
                proofs={filteredProofs}
                onView={modals.openView}
                onApprove={modals.openApprove}
                onReject={modals.openReject}
              />
              <ManualPaymentSidePanel proof={modals.selectedProof ?? filteredProofs[0] ?? null} onView={modals.openView} onApprove={modals.openApprove} onReject={modals.openReject} />
          </div>
        )}
      </Stack>

      <AdminProofViewModal opened={modals.mode === 'view'} proof={modals.selectedProof} onClose={modals.closeModal} />
      <AdminProofApproveModal
        opened={modals.mode === 'approve'}
        loading={mutations.approveMutation.isPending}
        proof={modals.selectedProof}
        onClose={modals.closeModal}
        onConfirm={() => {
          if (modals.selectedProof) {
            mutations.approveMutation.mutate(modals.selectedProof.id);
          }
        }}
      />
      <AdminProofRejectModal
        opened={modals.mode === 'reject'}
        loading={mutations.rejectMutation.isPending}
        form={rejectForm}
        onClose={modals.closeModal}
        onSubmit={() => {
          if (modals.selectedProof) {
            mutations.rejectMutation.mutate({
              proofId: modals.selectedProof.id,
              reason: rejectForm.values.reason
            });
          }
        }}
      />
    </div>
  );
}

function ManualPaymentSidePanel({
  proof,
  onView,
  onApprove,
  onReject
}: {
  proof: AdminManualPaymentProofModel | null;
  onView: (proof: AdminManualPaymentProofModel) => void;
  onApprove: (proof: AdminManualPaymentProofModel) => void;
  onReject: (proof: AdminManualPaymentProofModel) => void;
}) {
  if (!proof) {
    return null;
  }

  return (
    <aside className="enterprise-panel admin-payment-side-panel">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" fw={900} tt="uppercase" style={{ color: '#ffd98a' }}>Active Review</Text>
          <Text fw={950}>Order #{proof.shortOrderRef}</Text>
        </div>
        <button type="button" aria-label="Close review">×</button>
      </Group>
      <div className="admin-payment-side-item">
        <ItemImage imageUrl={proof.items[0]?.imageUrl ?? null} />
        <div>
          <Text fw={850} lineClamp={1}>{proof.items[0]?.productName ?? 'Order items'}</Text>
          <Text size="sm" c="dimmed">{proof.items.length} item{proof.items.length === 1 ? '' : 's'} attached</Text>
        </div>
      </div>
      <SimpleGrid cols={2}>
        <div className="admin-payment-reconcile-box">
          <Text size="xs" fw={900}>Order Total</Text>
          <Text fw={950}>{formatMoney(proof.orderTotalCents, proof.currency)}</Text>
        </div>
        <div className="admin-payment-reconcile-box">
          <Text size="xs" fw={900}>Submitted</Text>
          <Text fw={950}>{formatMoney(proof.amountCents, proof.currency)}</Text>
        </div>
      </SimpleGrid>
      <div className="admin-payment-proof-note">
        <Text fw={850}>{proof.receiptUrl ? 'Receipt attached' : 'No receipt attached'}</Text>
        <Text size="sm" c="dimmed">Receipt screenshots are optional. Use the customer’s payment reference and amount to review.</Text>
      </div>
      <Button fullWidth className="tt-btn-primary" onClick={() => onApprove(proof)}>Approve Payment</Button>
      <Group grow>
        <Button variant="light" onClick={() => onView(proof)}>Details</Button>
        <Button color="red" variant="light" onClick={() => onReject(proof)}>Reject</Button>
      </Group>
    </aside>
  );
}

function ItemImage({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) {
    return <span className="admin-mobile-item-icon">▤</span>;
  }
  return (
    <span className="admin-mobile-item-thumb">
      <img src={imageUrl} alt="" />
    </span>
  );
}
