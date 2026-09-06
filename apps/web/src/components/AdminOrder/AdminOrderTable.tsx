import { Button, Group, Paper, Table, Text } from '@mantine/core';
import { adminOrderStatusLabels } from '@snacks/shared';
import { formatMoney } from '@/lib/formatters/money';
import type { AdminOrderAction, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';
import { AdminOrderStatusBadge } from './AdminOrderStatusBadge';

interface AdminOrderTableProps {
  orders: AdminOrderListItem[];
  onView: (order: AdminOrderListItem) => void;
  onAction: (action: AdminOrderAction, order: AdminOrderListItem) => void;
}

export function AdminOrderTable({ orders, onView, onAction }: AdminOrderTableProps) {
  return (
    <>
      <div className="admin-mobile-card-list">
        {orders.map((order) => (
          <article key={order.id} className="admin-mobile-order-card">
            <div className="admin-mobile-card-topline">
              <div>
                <Text fw={900} className="admin-mobile-card-ref">#{order.shortRef}</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>{relativeTime(order.createdAt)}</Text>
              </div>
              <div className="text-right">
                <Text fw={950} className="admin-mobile-card-total">{formatMoney(order.totalCents, order.currency)}</Text>
                <Text size="xs" style={{ color: 'var(--tt-cream-muted)' }}>{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</Text>
              </div>
            </div>

            <Group gap="xs">
              <AdminOrderStatusBadge status={order.status} />
              {order.paymentStatus ? (
                <span className="admin-mobile-pill">{order.paymentStatusLabel ?? order.paymentStatus.replaceAll('_', ' ')}</span>
              ) : null}
            </Group>

            <div className="admin-mobile-card-customer">
              <div>
                <Text fw={850}>{order.customerName || 'Customer'}</Text>
                <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>{order.customerSummary || order.customerEmail || 'No contact added'}</Text>
              </div>
              {order.customerPhone ? (
                <a className="admin-mobile-icon-action" href={`tel:${order.customerPhone}`} aria-label={`Call ${order.customerName || 'customer'}`}>
                  ☎
                </a>
              ) : null}
            </div>

            <div className="admin-mobile-card-summary">
              <ItemPreviewThumb imageUrl={order.itemPreview[0]?.imageUrl ?? null} />
              <div>
                <Text fw={850} className="admin-mobile-card-item-title">{formatOrderPreview(order)}</Text>
                <Text size="sm" style={{ color: 'var(--tt-cream-muted)' }}>
                  {order.statusLabel || adminOrderStatusLabels[order.status] || order.status.replaceAll('_', ' ')} • Updated {relativeTime(order.updatedAt)}
                </Text>
              </div>
            </div>

            <div className="admin-mobile-card-actions">
              <OrderActionButtons order={order} onAction={onAction} fullWidth />
              <Button fullWidth variant="default" onClick={() => onView(order)} className="admin-mobile-secondary-button">
                Order Details
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Paper withBorder className="enterprise-panel overflow-hidden admin-desktop-table">
        <Table.ScrollContainer minWidth={980}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <Text fw={700}>{order.customerName}</Text>
                  <Text c="dimmed" size="sm">
                    {order.customerEmail}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <AdminOrderStatusBadge status={order.status} />
                </Table.Td>
                <Table.Td>{order.itemCount}</Table.Td>
                <Table.Td>{formatMoney(order.totalCents, order.currency)}</Table.Td>
                <Table.Td>{new Date(order.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => onView(order)}>
                      View Order
                    </Button>
                    <OrderActionButtons order={order} onAction={onAction} />
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

function OrderActionButtons({
  order,
  onAction,
  fullWidth = false
}: {
  order: AdminOrderListItem;
  onAction: (action: AdminOrderAction, order: AdminOrderListItem) => void;
  fullWidth?: boolean;
}) {
  if (order.status === 'paid') {
    return (
      <Button size={fullWidth ? 'sm' : 'xs'} fullWidth={fullWidth} onClick={() => onAction('prepare', order)}>
        Prepare
      </Button>
    );
  }
  if (order.status === 'preparing') {
    return (
      <Button size={fullWidth ? 'sm' : 'xs'} fullWidth={fullWidth} onClick={() => onAction('ready', order)}>
        Mark Ready
      </Button>
    );
  }
  if (order.status === 'ready_for_pickup' || order.status === 'ready_for_pickup_dispatch') {
    return (
      <Button size={fullWidth ? 'sm' : 'xs'} fullWidth={fullWidth} onClick={() => onAction('complete', order)}>
        Complete
      </Button>
    );
  }
  if (!['completed', 'cancelled', 'refunded', 'expired'].includes(order.status)) {
    return (
      <Button size={fullWidth ? 'sm' : 'xs'} fullWidth={fullWidth} color="red" variant="light" onClick={() => onAction('cancel', order)}>
        Cancel
      </Button>
    );
  }
  return null;
}

function formatOrderPreview(order: AdminOrderListItem) {
  if (!order.itemPreview.length) {
    return `${order.itemCount} item${order.itemCount === 1 ? '' : 's'}`;
  }

  const preview = order.itemPreview
    .map((item) => `${item.quantity}x ${item.productName}${item.skuName ? ` (${item.skuName})` : ''}`)
    .join(', ');
  const remaining = order.itemCount - order.itemPreview.reduce((sum, item) => sum + item.quantity, 0);

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
