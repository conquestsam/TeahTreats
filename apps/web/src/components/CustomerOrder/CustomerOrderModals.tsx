import { Modal, Skeleton } from '@mantine/core';
import { formatMoney } from '@/lib/formatters/money';
import type { CustomerOrderDetail, CustomerOrderListItem } from '@/types/CustomerOrder/customerOrderTypes';
import { isOrderPayable } from '@/lib/order/isOrderPayable';
import { CustomerOrderStatusBadge } from './CustomerOrderStatusBadge';

export function CustomerOrderDetailModal({
  opened,
  order,
  loading,
  onClose
}: {
  opened: boolean;
  order: CustomerOrderDetail | undefined;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--tt-font-editorial)', fontWeight: 600, fontSize: '1.2rem', color: 'var(--tt-cream)' }}>
            Order Inspection #{order?.id.slice(0, 8) ?? ''}
          </span>
        </div>
      }
      size="lg"
      centered
      classNames={{ content: 'tt-drawer', header: 'tt-drawer-header' }}
    >
      {loading || !order ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
          <Skeleton height={24} width={120} radius="md" />
          <Skeleton height={80} radius="md" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 6 }}>
          {/* Header Summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(184, 147, 62, 0.05)',
              border: '1px solid rgba(184, 147, 62, 0.18)',
              borderRadius: 12,
              padding: '14px 18px'
            }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Placed On
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--tt-cream)', margin: 0, marginTop: 2 }}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <CustomerOrderStatusBadge status={order.status} reservationExpiresAt={order.reservationExpiresAt} />
          </div>

          {/* Line Items List */}
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--tt-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>
              Purchased Items ({order.items.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--tt-surface)',
                    borderRadius: 10,
                    border: '1px solid rgba(184, 147, 62, 0.08)'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--tt-cream)' }}>
                      {item.productName}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--tt-cream-muted)', marginTop: 2 }}>
                      {item.skuName} × {item.quantity}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--tt-gold-light)' }}>
                    {formatMoney(item.lineTotalCents, order.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Delivery Details */}
          {order.customer?.address && (
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--tt-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
                Delivery Destination
              </p>
              <div style={{ background: 'var(--tt-surface)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(184, 147, 62, 0.08)' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--tt-cream)', margin: 0 }}>
                  {order.customer.name}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)', margin: 0, marginTop: 4 }}>
                  {order.customer.address}
                </p>
              </div>
            </div>
          )}

          {/* Total Cost Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(184, 147, 62, 0.15)', paddingTop: 16, marginTop: 4 }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--tt-cream-muted)', fontWeight: 600 }}>Total Order Value</span>
            <span style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '1.4rem', color: 'var(--tt-gold-light)', fontWeight: 700 }}>
              {formatMoney(order.totalCents, order.currency)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="tt-btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Close Window
            </button>
            {isOrderPayable(order) && (
              <a
                href={`/payment?orderId=${order.id}`}
                className="tt-btn-primary"
                style={{ padding: '8px 22px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Proceed to Payment →
              </a>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export function CustomerOrderCompleteModal({
  opened,
  order,
  loading,
  onClose,
  onConfirm
}: {
  opened: boolean;
  order: CustomerOrderListItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <span style={{ fontFamily: 'var(--tt-font-editorial)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--tt-cream)' }}>
          Confirm Order Receipt
        </span>
      }
      centered
      classNames={{ content: 'tt-drawer', header: 'tt-drawer-header' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--tt-cream-muted)', margin: 0 }}>
          Are you sure you want to mark order <strong>#{order?.id.slice(0, 8) ?? ''}</strong> as completed?
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="button"
            className="tt-btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Not Yet
          </button>
          <button
            type="button"
            className="tt-btn-primary"
            disabled={loading}
            onClick={onConfirm}
            style={{ padding: '8px 22px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {loading ? 'Confirming...' : 'Yes, Complete Order'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
