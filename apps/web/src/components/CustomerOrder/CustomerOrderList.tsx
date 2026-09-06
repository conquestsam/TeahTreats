import { formatMoney } from '@/lib/formatters/money';
import type { CustomerOrderListItem } from '@/types/CustomerOrder/customerOrderTypes';
import { isOrderPayable } from '@/lib/order/isOrderPayable';
import { CustomerOrderStatusBadge } from './CustomerOrderStatusBadge';

export function CustomerOrderList({
  orders,
  onView,
  onComplete
}: {
  orders: CustomerOrderListItem[];
  onView: (order: CustomerOrderListItem) => void;
  onComplete: (order: CustomerOrderListItem) => void;
}) {
  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div
          className="tt-panel"
          style={{
            overflow: 'hidden',
            borderRadius: 14,
            border: '1px solid rgba(184, 147, 62, 0.18)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(30, 30, 30, 0.8)', borderBottom: '1px solid rgba(184, 147, 62, 0.15)' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-gold)' }}>Order Identifier</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-gold)' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-gold)' }}>Items</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-gold)' }}>Total</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tt-gold)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  style={{
                    borderBottom: idx === orders.length - 1 ? 'none' : '1px solid rgba(184, 147, 62, 0.08)',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: 'var(--tt-cream)' }}>
                      #{order.id.slice(0, 8)}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--tt-cream-muted)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <CustomerOrderStatusBadge status={order.status} reservationExpiresAt={order.reservationExpiresAt} />
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--tt-cream)' }}>
                    {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-gold-light)' }}>
                    {formatMoney(order.totalCents, order.currency)}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                      {isOrderPayable(order) && (
                        <a
                          href={`/payment?orderId=${order.id}`}
                          className="tt-btn-primary"
                          style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', textDecoration: 'none' }}
                        >
                          Pay Now →
                        </a>
                      )}
                      <button
                        type="button"
                        className="tt-btn-secondary"
                        onClick={() => onView(order)}
                        style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Inspect Details
                      </button>
                      {(order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch') && (
                        <button
                          type="button"
                          className="tt-btn-primary"
                          onClick={() => onComplete(order)}
                          style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="tt-panel"
            style={{
              padding: 20,
              borderRadius: 14,
              border: '1px solid rgba(184, 147, 62, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--tt-cream)' }}>
                  Order #{order.id.slice(0, 8)}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tt-cream-muted)', marginTop: 2 }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <CustomerOrderStatusBadge status={order.status} reservationExpiresAt={order.reservationExpiresAt} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--tt-surface)', padding: '10px 14px', borderRadius: 10 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)' }}>{order.itemCount} item(s)</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-gold-light)' }}>
                {formatMoney(order.totalCents, order.currency)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {isOrderPayable(order) && (
                <a
                  href={`/payment?orderId=${order.id}`}
                  className="tt-btn-primary"
                  style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}
                >
                  Pay Now →
                </a>
              )}
              <button
                type="button"
                className="tt-btn-secondary"
                onClick={() => onView(order)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
              >
                Inspect Details
              </button>
              {(order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch') && (
                <button
                  type="button"
                  className="tt-btn-primary"
                  onClick={() => onComplete(order)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                >
                  Complete Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
