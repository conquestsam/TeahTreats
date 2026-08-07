'use client';

import { CustomerOrderList } from '@/components/functional-components/CustomerOrder/CustomerOrderList';
import {
  CustomerOrderCompleteModal,
  CustomerOrderDetailModal
} from '@/components/functional-components/CustomerOrder/CustomerOrderModals';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useCustomerOrderModals } from '@/hooks/CustomerOrder/useCustomerOrderModals';
import { useCustomerOrderMutations } from '@/hooks/CustomerOrder/useCustomerOrderMutations';
import { useCustomerOrderDetailsQuery, useCustomerOrdersQuery } from '@/hooks/CustomerOrder/useCustomerOrderQuery';

export function CustomerOrderContent() {
  const currentCustomerQuery = useCurrentCustomerQuery();
  const ordersQuery = useCustomerOrdersQuery(Boolean(currentCustomerQuery.data));
  const modals = useCustomerOrderModals();
  const detailsQuery = useCustomerOrderDetailsQuery(modals.selectedOrderId);
  const mutations = useCustomerOrderMutations(modals.closeModal);
  const orders = ordersQuery.data ?? [];

  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'expired'
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;

  if (currentCustomerQuery.isLoading) {
    return (
      <div className="tt-container" style={{ paddingBlock: '56px', textAlign: 'center' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '2px solid var(--tt-gold-muted)',
            borderTopColor: 'var(--tt-gold)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}
        />
        <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.9rem' }}>Verifying your account details...</p>
      </div>
    );
  }

  if (currentCustomerQuery.isError) {
    return (
      <div className="tt-container" style={{ paddingBlock: '56px', maxWidth: 480 }}>
        <div className="tt-panel" style={{ padding: 32, textAlign: 'center' }}>
          <h2 className="tt-editorial" style={{ fontSize: '1.4rem', marginBottom: 8, color: 'var(--tt-cream)' }}>
            Account Sign In Required
          </h2>
          <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.88rem', marginBottom: 24 }}>
            Please sign in to access your purchase history and order tracking.
          </p>
          <a
            href="/login"
            className="tt-btn-primary"
            style={{
              display: 'inline-flex',
              padding: '12px 28px',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            Sign In to Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p className="tt-eyebrow" style={{ marginBottom: 8 }}>Customer Portal</p>
              <h1 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', margin: 0 }}>
                My Orders & Purchases
              </h1>
            </div>
            <a
              href="/account"
              className="tt-btn-secondary"
              style={{ padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem' }}
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Order Metrics Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div className="tt-panel" style={{ padding: '16px 20px', borderRadius: 12 }}>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-cream-muted)', margin: 0 }}>
                Total Purchases
              </p>
              <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '1.8rem', color: 'var(--tt-gold-light)', fontWeight: 700, margin: '4px 0 0' }}>
                {totalOrdersCount}
              </p>
            </div>

            <div className="tt-panel" style={{ padding: '16px 20px', borderRadius: 12 }}>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-cream-muted)', margin: 0 }}>
                Active Processing
              </p>
              <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '1.8rem', color: 'var(--tt-gold)', fontWeight: 700, margin: '4px 0 0' }}>
                {activeOrdersCount}
              </p>
            </div>

            <div className="tt-panel" style={{ padding: '16px 20px', borderRadius: 12 }}>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-cream-muted)', margin: 0 }}>
                Delivered / Completed
              </p>
              <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '1.8rem', color: '#4ade80', fontWeight: 700, margin: '4px 0 0' }}>
                {completedOrdersCount}
              </p>
            </div>
          </div>

          {/* Orders Listing State */}
          {ordersQuery.isLoading ? (
            <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid var(--tt-gold-muted)',
                  borderTopColor: 'var(--tt-gold)',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}
              />
              <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.85rem' }}>Fetching order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(184, 147, 62, 0.08)',
                  border: '1px solid var(--tt-gold-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontFamily: 'var(--tt-font-editorial)',
                  fontSize: '1.5rem',
                  color: 'var(--tt-gold)'
                }}
              >
                O
              </div>
              <h3 className="tt-editorial" style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--tt-cream)' }}>
                No Orders Placed Yet
              </h3>
              <p className="tt-body" style={{ fontSize: '0.88rem', marginBottom: 24, maxWidth: 400, marginInline: 'auto' }}>
                Discover our artisanal snack collections, bundles, and treats to place your first order.
              </p>
              <a
                href="/products"
                className="tt-btn-primary"
                style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontSize: '0.88rem' }}
              >
                Explore Snack Catalog →
              </a>
            </div>
          ) : (
            <CustomerOrderList orders={orders} onView={modals.openDetail} onComplete={modals.openComplete} />
          )}
        </div>
      </div>

      <CustomerOrderDetailModal
        opened={modals.mode === 'detail'}
        order={detailsQuery.data}
        loading={detailsQuery.isLoading}
        onClose={modals.closeModal}
      />
      <CustomerOrderCompleteModal
        opened={modals.mode === 'complete'}
        order={modals.selectedOrder}
        loading={mutations.completeMutation.isPending}
        onClose={modals.closeModal}
        onConfirm={() => {
          if (modals.selectedOrder) {
            mutations.completeMutation.mutate(modals.selectedOrder.id);
          }
        }}
      />
    </div>
  );
}
