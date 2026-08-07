'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Modal, Table, Skeleton } from '@mantine/core';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useCustomerLogoutMutation } from '@/hooks/CustomerAuth/useCustomerAuthMutations';
import { useCustomerOrdersQuery, useCustomerOrderDetailsQuery } from '@/hooks/CustomerOrder/useCustomerOrderQuery';
import { isOrderPayable } from '@/lib/order/isOrderPayable';
import { CustomerOrderStatusBadge } from '@/components/functional-components/CustomerOrder/CustomerOrderStatusBadge';

// Utility helper to format cents to USD currency string
function formatCurrency(cents: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(cents / 100);
}

// Status badge styling helper
function getStatusBadge(status: string) {
    switch (status) {
        case 'completed':
            return { label: 'Completed', className: 'tt-badge-in-stock' };
        case 'preparing':
        case 'ready_for_pickup':
            return { label: status.replaceAll('_', ' '), className: 'tt-badge-gold' };
        case 'inventory_reserved':
        case 'payment_pending':
            return { label: status.replaceAll('_', ' '), className: 'tt-badge-low-stock' };
        case 'cancelled':
        case 'expired':
            return { label: status.replaceAll('_', ' '), className: 'tt-badge-out-of-stock' };
        default:
            return { label: status.replaceAll('_', ' '), className: 'tt-badge-gold' };
    }
}

export function CustomerDashboardContent() {
    const customerQuery = useCurrentCustomerQuery();
    const ordersQuery = useCustomerOrdersQuery();
    const logoutMutation = useCustomerLogoutMutation();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const orderDetailsQuery = useCustomerOrderDetailsQuery(selectedOrderId);

    const customer = customerQuery.data;
    const orders = ordersQuery.data ?? [];

    // Metrics Calculations
    const totalOrders = orders.length;
    const totalSpentCents = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const activeOrders = orders.filter((order) =>
        ['inventory_reserved', 'payment_pending', 'preparing', 'ready_for_pickup'].includes(order.status)
    ).length;

    const pendingPaymentOrder = orders.find((order) => isOrderPayable(order));

    return (
        <div className="tt-container" style={{ paddingBlock: '48px 80px' }}>
            {/* ── Top Header Bar ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    marginBottom: 28
                }}
            >
                <div>
                    <p className="tt-eyebrow" style={{ marginBottom: 6 }}>Account Overview</p>
                    <h1 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', margin: 0 }}>
                        Welcome back, {customer?.name || 'Valued Customer'}
                    </h1>
                    <p className="tt-body" style={{ fontSize: '0.88rem', margin: 0, marginTop: 4 }}>
                        {customer?.email}
                    </p>
                </div>

                <button
                    type="button"
                    className="tt-btn-secondary"
                    disabled={logoutMutation.isPending}
                    onClick={() => logoutMutation.mutate()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    {logoutMutation.isPending ? (
                        <span>Signing Out...</span>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Sign Out</span>
                        </>
                    )}
                </button>
            </div>

            {/* ── Pending Payment Alert Banner ── */}
            {pendingPaymentOrder && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="tt-panel"
                    style={{
                        padding: '16px 20px',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(184, 147, 62, 0.15), rgba(155, 27, 48, 0.08))',
                        border: '1.5px solid var(--tt-gold)',
                        marginBottom: 32,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(184, 147, 62, 0.2)',
                                border: '1px solid var(--tt-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--tt-gold-light)',
                                fontSize: '1.2rem',
                                flexShrink: 0
                            }}
                        >
                            💳
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-cream)' }}>
                                Pending Payment Required — Order #{pendingPaymentOrder.id.slice(0, 8)}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--tt-cream-muted)', marginTop: 2 }}>
                                Total: {formatCurrency(pendingPaymentOrder.totalCents, pendingPaymentOrder.currency)} • Placed on {new Date(pendingPaymentOrder.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <a
                        href={`/payment?orderId=${pendingPaymentOrder.id}`}
                        className="tt-btn-primary"
                        style={{
                            padding: '10px 22px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                        }}
                    >
                        <span>Complete Payment →</span>
                    </a>
                </motion.div>
            )}

            {/* ── Section 1: Dashboard Metrics Cards ── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 20,
                    marginBottom: 44
                }}
            >
                {/* Metric 1: Total Orders */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <div className="tt-panel" style={{ padding: '24px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                Total Orders
                            </span>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(184, 147, 62, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tt-gold)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                </svg>
                            </div>
                        </div>
                        {ordersQuery.isLoading ? (
                            <Skeleton height={28} width={80} radius="md" />
                        ) : (
                            <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--tt-cream)', margin: 0 }}>
                                {totalOrders}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Metric 2: Lifetime Spent */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
                    <div className="tt-panel" style={{ padding: '24px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                Lifetime Spent
                            </span>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                        </div>
                        {ordersQuery.isLoading ? (
                            <Skeleton height={28} width={100} radius="md" />
                        ) : (
                            <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--tt-gold-light)', margin: 0 }}>
                                {formatCurrency(totalSpentCents)}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Metric 3: Active Orders */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
                    <div className="tt-panel" style={{ padding: '24px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--tt-cream-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                Active Reservations
                            </span>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(155, 27, 48, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tt-crimson-light)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                        </div>
                        {ordersQuery.isLoading ? (
                            <Skeleton height={28} width={60} radius="md" />
                        ) : (
                            <p style={{ fontFamily: 'var(--tt-font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--tt-cream)', margin: 0 }}>
                                {activeOrders}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Section 2: Order History Table ── */}
            <div className="tt-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h3 className="tt-editorial" style={{ fontSize: '1.3rem', margin: 0, color: 'var(--tt-cream)' }}>
                            Order History
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)', margin: 0, marginTop: 4 }}>
                            Click any order row to inspect reservation line items and receipt summary.
                        </p>
                    </div>
                    <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20 }}>
                        {orders.length} {orders.length === 1 ? 'Record' : 'Records'}
                    </span>
                </div>

                {ordersQuery.isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Skeleton height={40} radius="md" />
                        <Skeleton height={40} radius="md" />
                        <Skeleton height={40} radius="md" />
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--tt-cream-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                            You haven't placed any orders yet.
                        </p>
                        <a href="/products" className="tt-btn-primary" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 8, fontSize: '0.85rem' }}>
                            Browse Snacks
                        </a>
                    </div>
                ) : (
                    <Table.ScrollContainer minWidth={600}>
                        <Table verticalSpacing="sm" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ color: 'var(--tt-gold)', fontSize: '0.75rem' }}>Order ID</Table.Th>
                                    <Table.Th style={{ color: 'var(--tt-gold)', fontSize: '0.75rem' }}>Date</Table.Th>
                                    <Table.Th style={{ color: 'var(--tt-gold)', fontSize: '0.75rem' }}>Items</Table.Th>
                                    <Table.Th style={{ color: 'var(--tt-gold)', fontSize: '0.75rem' }}>Total</Table.Th>
                                    <Table.Th style={{ color: 'var(--tt-gold)', fontSize: '0.75rem' }}>Status</Table.Th>
                                    <Table.Th style={{ color: 'var(--tt-gold)', fontSize: '0.75rem', textAlign: 'right' }}>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {orders.map((order) => {
                                    const badge = getStatusBadge(order.status);
                                    return (
                                        <Table.Tr
                                            key={order.id}
                                            style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                            onClick={() => setSelectedOrderId(order.id)}
                                        >
                                            <Table.Td style={{ fontWeight: 600, color: 'var(--tt-cream)', fontSize: '0.85rem' }}>
                                                #{order.id.slice(0, 8)}...
                                            </Table.Td>
                                            <Table.Td style={{ fontSize: '0.82rem', color: 'var(--tt-cream-muted)' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </Table.Td>
                                            <Table.Td style={{ fontSize: '0.85rem', color: 'var(--tt-cream-muted)' }}>
                                                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                                            </Table.Td>
                                            <Table.Td style={{ fontWeight: 600, color: 'var(--tt-gold-light)', fontSize: '0.88rem' }}>
                                                {formatCurrency(order.totalCents, order.currency)}
                                            </Table.Td>
                                            <Table.Td>
                                                <CustomerOrderStatusBadge status={order.status} reservationExpiresAt={order.reservationExpiresAt} />
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    {isOrderPayable(order) && (
                                                        <a
                                                            href={`/payment?orderId=${order.id}`}
                                                            className="tt-btn-primary"
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ padding: '6px 14px', borderRadius: 6, fontSize: '0.75rem', textDecoration: 'none' }}
                                                        >
                                                            Pay Now →
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="tt-btn-secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrderId(order.id);
                                                        }}
                                                        style={{ padding: '6px 14px', borderRadius: 6, fontSize: '0.75rem', minHeight: 'unset' }}
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </div>

            {/* ── Section 3: Order Details Modal ── */}
            <Modal
                opened={Boolean(selectedOrderId)}
                onClose={() => setSelectedOrderId(null)}
                title={
                    <span style={{ fontFamily: 'var(--tt-font-editorial)', fontWeight: 600, color: 'var(--tt-cream)', fontSize: '1.15rem' }}>
                        Order Details #{selectedOrderId?.slice(0, 8)}
                    </span>
                }
                centered
                size="lg"
                classNames={{ content: 'tt-drawer', header: 'tt-drawer-header' }}
            >
                {orderDetailsQuery.isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
                        <Skeleton height={30} radius="md" />
                        <Skeleton height={100} radius="md" />
                    </div>
                ) : orderDetailsQuery.data ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 10 }}>
                        {/* Header info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(184, 147, 62, 0.05)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(184, 147, 62, 0.15)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', margin: 0 }}>Placed On</p>
                                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--tt-cream)', margin: 0 }}>
                                    {new Date(orderDetailsQuery.data.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--tt-cream-muted)', margin: 0, textAlign: 'right' }}>Total</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--tt-gold-light)', margin: 0 }}>
                                    {formatCurrency(orderDetailsQuery.data.totalCents, orderDetailsQuery.data.currency)}
                                </p>
                            </div>
                        </div>

                        {/* Line items list */}
                        <div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--tt-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
                                Items ({orderDetailsQuery.data.items.length})
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {orderDetailsQuery.data.items.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--tt-surface)', borderRadius: 8, border: '1px solid rgba(184, 147, 62, 0.08)' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--tt-cream)' }}>{item.productName}</p>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--tt-cream-muted)' }}>
                                                {item.skuName} × {item.quantity}
                                            </p>
                                        </div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--tt-gold)' }}>
                                            {formatCurrency(item.lineTotalCents, orderDetailsQuery.data?.currency)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {orderDetailsQuery.data.customer?.address && (
                            <div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--tt-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>
                                    Shipping Address
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--tt-cream-muted)', background: 'var(--tt-surface)', padding: '10px 14px', borderRadius: 8, margin: 0 }}>
                                    {orderDetailsQuery.data.customer.address}
                                </p>
                            </div>
                        )}

                        {/* Payment Action CTA inside Modal if payable */}
                        {isOrderPayable(orderDetailsQuery.data) && (
                            <div style={{ borderTop: '1px solid rgba(184, 147, 62, 0.15)', paddingTop: 16, marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <a
                                    href={`/payment?orderId=${orderDetailsQuery.data.id}`}
                                    className="tt-btn-primary"
                                    style={{ padding: '10px 22px', borderRadius: 8, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700 }}
                                >
                                    Proceed to Payment →
                                </a>
                            </div>
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}