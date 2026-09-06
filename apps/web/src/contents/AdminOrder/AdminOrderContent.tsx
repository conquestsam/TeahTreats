'use client';

import { useMemo, useState } from 'react';
import { Button, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { adminOrderStatusLabels, type OrderStatusValue } from '@snacks/shared';

import {
  AdminOrderCancelModal,
  AdminOrderConfirmModal,
  AdminOrderDetailModal
} from '@/components/AdminOrder/AdminOrderModals';
import { AdminOrderTable } from '@/components/AdminOrder/AdminOrderTable';
import { useAdminOrderCancelForm } from '@/hooks/AdminOrder/useAdminOrderForm';
import { useAdminOrderModals } from '@/hooks/AdminOrder/useAdminOrderModals';
import { useAdminOrderMutations } from '@/hooks/AdminOrder/useAdminOrderMutations';
import { useAdminOrderDetailsQuery, useAdminOrdersQuery } from '@/hooks/AdminOrder/useAdminOrderQuery';
import { formatMoney } from '@/lib/formatters/money';
import type { AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderQueueFilter>('all');
  const confirmationMode =
    modals.mode === 'prepare' || modals.mode === 'ready' || modals.mode === 'complete'
      ? modals.mode
      : null;

  const readyCount = orders.filter((order) => order.status === 'ready_for_pickup').length;
  const preparingCount = orders.filter((order) => order.status === 'preparing').length;
  const paidCount = orders.filter((order) => order.status === 'paid').length;
  const revenue = orders.reduce((total, order) => total + order.totalCents, 0);
  const currency = orders[0]?.currency ?? 'USD';
  const awaitingProofCount = orders.filter((order) => awaitingProofStatuses.includes(order.status)).length;
  const filteredOrders = useMemo(
    () => filterOrders(orders, activeFilter, searchTerm),
    [activeFilter, orders, searchTerm],
  );

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <div className="admin-desktop-page-header">
          <AppPageHeader
            eyebrow="Order operations"
            title="Orders"
            description="Move paid orders through preparation, readiness, completion, or cancellation with confirmation."
            badge={`${orders.length} orders`}
          />
        </div>

        <section className="admin-mobile-workflow-header">
          <div className="admin-mobile-brand-row">
            <div>
              <Text fw={950} className="admin-mobile-brand-title">TeshTreats <span>Admin</span></Text>
              <Text className="admin-mobile-live-dot">Kitchen live</Text>
            </div>
            <Group gap="xs" wrap="nowrap">
              <span className="admin-mobile-alert-badge">{awaitingProofCount}</span>
              <span className="admin-mobile-avatar">A</span>
            </Group>
          </div>
          <Group justify="space-between" align="end" gap="md" wrap="nowrap">
            <div>
              <Text fw={900} className="admin-mobile-page-title">Orders</Text>
              <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>Real-time order queue and status manager</Text>
            </div>
            <span className="admin-mobile-vault-chip">Review mode</span>
          </Group>
        </section>

        <SimpleGrid cols={{ base: 3, sm: 2, lg: 4 }} className="admin-mobile-compact-metrics admin-order-metrics">
          <MetricCard label="Paid" value={paidCount} hint="Ready to prepare" tone="green" />
          <MetricCard label="Preparing" value={preparingCount} hint="Kitchen workflow" tone="orange" />
          <MetricCard label="Ready" value={readyCount} hint="Notify customer" tone="blue" />
          <MetricCard label="Order value" value={formatMoney(revenue, currency)} hint="Current list" tone="gray" />
        </SimpleGrid>

        <div className="admin-mobile-queue-tools">
          <TextInput
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            placeholder="Search order ref, customer name, phone..."
            aria-label="Search orders"
          />
          <div className="admin-mobile-filter-row" role="tablist" aria-label="Order filters">
            {orderQueueFilters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="xs"
                variant={activeFilter === filter.value ? 'filled' : 'subtle'}
                onClick={() => setActiveFilter(filter.value)}
                className={activeFilter === filter.value ? 'admin-mobile-filter-chip admin-mobile-filter-chip-active' : 'admin-mobile-filter-chip'}
              >
                {filter.label}
                <span>{countOrdersForFilter(orders, filter.value)}</span>
              </Button>
            ))}
          </div>
        </div>

        {ordersQuery.isLoading ? (
          <StateCard loading title="Loading orders..." description="Checking latest status changes." />
        ) : filteredOrders.length === 0 ? (
          <StateCard title="No orders yet." description="Paid orders will appear here after checkout and payment." tone="warning" />
        ) : (
          <div>
              <AdminOrderTable orders={filteredOrders} onView={modals.openDetail} onAction={modals.openAction} />
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

type OrderQueueFilter = 'all' | 'awaiting-proof' | 'preparing' | 'ready';

const awaitingProofStatuses: OrderStatusValue[] = [
  'manual_payment_proof_submitted',
  'awaiting_admin_payment_approval',
  'payment_pending'
];

const orderQueueFilters: Array<{ value: OrderQueueFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'awaiting-proof', label: 'Awaiting Proof' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' }
];

function filterOrders(
  orders: AdminOrderListItem[],
  filter: OrderQueueFilter,
  searchTerm: string,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'awaiting-proof'
        ? awaitingProofStatuses.includes(order.status)
        : filter === 'preparing'
        ? order.status === 'preparing' || order.status === 'paid' || order.status === 'payment_approved'
        : order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch';

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [order.id, order.customerName, order.customerEmail, order.customerPhone, adminOrderStatusLabels[order.status]]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);
  });
}

function countOrdersForFilter(
  orders: Array<{ status: OrderStatusValue }>,
  filter: OrderQueueFilter,
) {
  if (filter === 'all') {
    return orders.length;
  }
  if (filter === 'awaiting-proof') {
    return orders.filter((order) => awaitingProofStatuses.includes(order.status)).length;
  }
  if (filter === 'preparing') {
    return orders.filter((order) => order.status === 'preparing' || order.status === 'paid' || order.status === 'payment_approved').length;
  }
  return orders.filter((order) => order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch').length;
}
