'use client';

import { SimpleGrid, Stack } from '@mantine/core';

import {
  AdminOrderCancelModal,
  AdminOrderConfirmModal,
  AdminOrderDetailModal
} from '@/components/functional-components/AdminOrder/AdminOrderModals';
import { AdminOrderTable } from '@/components/functional-components/AdminOrder/AdminOrderTable';
import { useAdminOrderCancelForm } from '@/hooks/AdminOrder/useAdminOrderForm';
import { useAdminOrderModals } from '@/hooks/AdminOrder/useAdminOrderModals';
import { useAdminOrderMutations } from '@/hooks/AdminOrder/useAdminOrderMutations';
import { useAdminOrderDetailsQuery, useAdminOrdersQuery } from '@/hooks/AdminOrder/useAdminOrderQuery';
import { AppPageHeader } from '@/components/ui/app-page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { StateCard } from '@/components/ui/state-card';

export function AdminOrderContent() {
  const ordersQuery = useAdminOrdersQuery();
  const modals = useAdminOrderModals();
  const cancelForm = useAdminOrderCancelForm();
  const detailQuery = useAdminOrderDetailsQuery(modals.selectedOrderId);
  const mutations = useAdminOrderMutations(() => {
    cancelForm.reset();
    modals.closeModal();
  });
  const orders = ordersQuery.data ?? [];
  const confirmationMode =
    modals.mode === 'prepare' || modals.mode === 'ready' || modals.mode === 'complete'
      ? modals.mode
      : null;

  const readyCount = orders.filter((order) => order.status === 'ready_for_pickup').length;
  const preparingCount = orders.filter((order) => order.status === 'preparing').length;
  const paidCount = orders.filter((order) => order.status === 'paid').length;
  const revenue = orders.reduce((total, order) => total + order.totalCents, 0);

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AppPageHeader
          eyebrow="Order operations"
          title="Orders"
          description="Move paid orders through preparation, readiness, completion, or cancellation with confirmation."
          badge={`${orders.length} orders`}
        />
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard label="Paid" value={paidCount} hint="Ready to prepare" tone="green" />
          <MetricCard label="Preparing" value={preparingCount} hint="Kitchen workflow" tone="orange" />
          <MetricCard label="Ready" value={readyCount} hint="Notify customer" tone="blue" />
          <MetricCard label="Visible value" value={`$${(revenue / 100).toFixed(2)}`} hint="Snapshot totals" tone="gray" />
        </SimpleGrid>
        {ordersQuery.isLoading ? (
          <StateCard loading title="Loading orders..." description="Checking latest status changes." />
        ) : orders.length === 0 ? (
          <StateCard title="No orders yet." description="Paid orders will appear here after checkout and payment." tone="warning" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
              <AdminOrderTable orders={orders} onView={modals.openDetail} onAction={modals.openAction} />
          </div>
        )}
      </Stack>

      <AdminOrderDetailModal
        opened={modals.mode === 'detail'}
        order={detailQuery.data}
        loading={detailQuery.isLoading}
        onClose={modals.closeModal}
      />
      {confirmationMode ? (
        <AdminOrderConfirmModal
          opened
          action={confirmationMode}
          order={modals.selectedOrder}
          loading={actionLoading(confirmationMode, mutations)}
          onClose={modals.closeModal}
          onConfirm={() => {
            if (!modals.selectedOrder) {
              return;
            }
            if (confirmationMode === 'prepare') {
              mutations.prepareMutation.mutate(modals.selectedOrder.id);
            } else if (confirmationMode === 'ready') {
              mutations.readyMutation.mutate(modals.selectedOrder.id);
            } else {
              mutations.completeMutation.mutate(modals.selectedOrder.id);
            }
          }}
        />
      ) : null}
      <AdminOrderCancelModal
        opened={modals.mode === 'cancel'}
        form={cancelForm}
        loading={mutations.cancelMutation.isPending}
        onClose={modals.closeModal}
        onSubmit={() => {
          if (modals.selectedOrder) {
            mutations.cancelMutation.mutate({
              orderId: modals.selectedOrder.id,
              reason: cancelForm.values.reason
            });
          }
        }}
      />
    </div>
  );
}

function actionLoading(
  action: 'prepare' | 'ready' | 'complete',
  mutations: ReturnType<typeof useAdminOrderMutations>,
) {
  if (action === 'prepare') {
    return mutations.prepareMutation.isPending;
  }
  if (action === 'ready') {
    return mutations.readyMutation.isPending;
  }
  return mutations.completeMutation.isPending;
}
