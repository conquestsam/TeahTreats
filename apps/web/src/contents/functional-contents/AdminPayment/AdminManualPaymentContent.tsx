'use client';

import { SimpleGrid, Stack } from '@mantine/core';

import {
  AdminProofApproveModal,
  AdminProofRejectModal,
  AdminProofViewModal
} from '@/components/functional-components/AdminPayment/AdminManualProofModals';
import { AdminManualProofTable } from '@/components/functional-components/AdminPayment/AdminManualProofTable';
import { useRejectManualPaymentForm } from '@/hooks/AdminPayment/useAdminPaymentForm';
import { useAdminPaymentModals } from '@/hooks/AdminPayment/useAdminPaymentModals';
import { useAdminPaymentMutations } from '@/hooks/AdminPayment/useAdminPaymentMutations';
import { useManualPaymentProofQuery } from '@/hooks/AdminPayment/useAdminPaymentQuery';
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

  const pendingCount = proofs.length;

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AppPageHeader
          eyebrow="Payment review"
          title="Manual Payments"
          description="Review receipts from Cash App, Venmo, Zelle, and other configured manual methods."
          badge={`${pendingCount} pending`}
        />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard label="Pending proofs" value={pendingCount} hint="Needs review" tone="orange" />
          <MetricCard label="Proofs loaded" value={proofs.length} hint="Current tenant" tone="blue" />
          <MetricCard label="Approval mode" value="Manual" hint="Atomic review flow" tone="green" />
          <MetricCard label="Notifications" value="Outbox" hint="Admin alerts ready" tone="gray" />
        </SimpleGrid>
        {proofsQuery.isLoading ? (
          <StateCard loading title="Loading receipts..." description="Checking manual payment proofs." />
        ) : proofs.length === 0 ? (
          <StateCard title="No pending proofs." description="New receipts will appear here after customers upload payment proof." tone="success" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
              <AdminManualProofTable
                proofs={proofs}
                onView={modals.openView}
                onApprove={modals.openApprove}
                onReject={modals.openReject}
              />
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
