'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useClaimGuestOrderMutation } from '@/hooks/CustomerOrder/useCustomerOrderMutations';
import { useCustomerOrderDetailsQuery, useVerifiedCustomerOrderDetailsQuery } from '@/hooks/CustomerOrder/useCustomerOrderQuery';
import { formatMoney } from '@/lib/formatters/money';
import type { CustomerOrderDetail, CustomerOrderListItem } from '@/types/CustomerOrder/customerOrderTypes';

const statusSteps = [
  'checkout_started',
  'payment_pending',
  'paid',
  'preparing',
  'ready_for_pickup_dispatch',
  'completed'
] as const;

const customerStatusLabels: Record<string, string> = {
  cart: 'Cart saved',
  checkout_started: 'Order started',
  inventory_reserved: 'Items reserved',
  payment_pending: 'Payment pending',
  manual_payment_proof_submitted: 'Payment submitted',
  awaiting_admin_payment_approval: 'Payment being reviewed',
  payment_approved: 'Payment approved',
  paid: 'Payment confirmed',
  preparing: 'Preparing your order',
  ready_for_pickup: 'Ready for pickup',
  ready_for_pickup_dispatch: 'Ready for handoff',
  completed: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  partially_refunded: 'Partially refunded',
  payment_failed: 'Payment needs attention',
  expired: 'Order expired'
};

export function CustomerOrderDetailContent({ orderId }: { orderId: string }) {
  const currentCustomerQuery = useCurrentCustomerQuery();
  const [savedContact, setSavedContact] = useState<{ email: string; phone: string } | null>(null);
  const claimOrderMutation = useClaimGuestOrderMutation();
  const orderQuery = useCustomerOrderDetailsQuery(currentCustomerQuery.data ? orderId : null);
  const shouldUseVerifiedLookup = Boolean(savedContact && (!currentCustomerQuery.data || orderQuery.isError));
  const verifiedOrderQuery = useVerifiedCustomerOrderDetailsQuery(shouldUseVerifiedLookup && savedContact ? {
    orderId,
    email: savedContact.email,
    phone: savedContact.phone
  } : null);
  const order = orderQuery.data ?? verifiedOrderQuery.data;

  useEffect(() => {
    if (!orderId || typeof window === 'undefined') {
      return;
    }
    const raw = window.sessionStorage.getItem(`teahTreats.checkout.${orderId}`);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { email?: string; phone?: string };
      if (parsed.email && parsed.phone) {
        setSavedContact({ email: parsed.email, phone: parsed.phone });
      }
    } catch {
      window.sessionStorage.removeItem(`teahTreats.checkout.${orderId}`);
    }
  }, [orderId]);

  const activeStepIndex = useMemo(() => {
    if (!order) return 0;
    const index = statusSteps.findIndex((status) => status === order.status);
    if (index >= 0) return index;
    if (['manual_payment_proof_submitted', 'awaiting_admin_payment_approval', 'payment_approved'].includes(order.status)) return 1;
    if (order.status === 'ready_for_pickup') return 4;
    if (['cancelled', 'expired', 'payment_failed'].includes(order.status)) return 1;
    return 0;
  }, [order]);

  if (currentCustomerQuery.isLoading || orderQuery.isLoading || verifiedOrderQuery.isLoading) {
    return (
      <main className="tt-container py-12">
        <Card className="border-[#312b31] bg-[#1f1d23]">
          <CardContent className="p-8 text-center text-[#bca6a7]">Loading your order...</CardContent>
        </Card>
      </main>
    );
  }

  if (!currentCustomerQuery.data && !savedContact) {
    return (
      <main className="tt-container py-12">
        <CustomerOrderState
          title="Confirm your order contact"
          description="For guest orders, open this page from checkout or payment so we can verify the email and phone saved with the order."
          primaryHref="/login"
          primaryLabel="Sign In"
          secondaryHref="/payment"
          secondaryLabel="Open Payment Lookup"
        />
      </main>
    );
  }

  if (orderQuery.isError || verifiedOrderQuery.isError || !order) {
    return (
      <main className="tt-container py-12">
        <CustomerOrderState
          title="We could not find that order yet"
          description="It may still be saving. You can check your orders, continue shopping, or contact support."
          primaryHref="/account/orders"
          primaryLabel="Check My Orders"
          secondaryHref="/products"
          secondaryLabel="Continue Shopping"
        />
      </main>
    );
  }

  const latestPayment = order.payments[0];
  const primaryItem = order.items[0];
  const deliveryAddress = [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.city,
    order.customer.state,
    order.customer.postalCode
  ].filter(Boolean).join(', ') || order.customer.address || 'Address not captured';
  const deliveryWindow = order.customer.deliveryWindowLabel
    ?? [order.customer.deliveryDate, order.customer.deliveryWindow].filter(Boolean).join(' • ')
    ?? '';
  const fulfillmentLabel = fulfillmentMethodLabel(order.customer.fulfillmentMethod);

  return (
    <main className="tt-container py-8 md:py-12">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f0c66d]">My Orders</p>
          <h1 className="mt-2 text-3xl font-black text-[#fff7e8] md:text-5xl">Order Details</h1>
          <p className="mt-2 text-sm text-[#bca6a7]">
            Order {displayOrderRef(order)} placed {new Date(order.createdAt).toLocaleString()}.
          </p>
        </div>
        <Badge variant={order.status === 'payment_failed' ? 'red' : 'default'}>{customerStatusLabels[order.status] ?? order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          {currentCustomerQuery.data && order.isGuestCheckout && savedContact ? (
            <Card className="border-[#f0c66d]/35 bg-[#211d23]">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#fff7e8]">Save this order to your account</p>
                  <p className="mt-1 text-sm text-[#bca6a7]">Keep this guest order in your permanent order history.</p>
                </div>
                <Button
                  variant="gold"
                  disabled={claimOrderMutation.isPending}
                  onClick={() => claimOrderMutation.mutate({
                    orderId,
                    email: savedContact.email,
                    phone: savedContact.phone
                  })}
                >
                  {claimOrderMutation.isPending ? 'Saving...' : 'Save Order'}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-[#342d32] bg-[#1f1d23]">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Live Status</CardTitle>
                <Button asChild variant="secondary" size="sm">
                  <Link href="#handoff-progress">Open Tracking Timeline</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#302a31]">
                <span className="block h-full rounded-full bg-[#f0c66d]" style={{ width: `${Math.max(12, ((activeStepIndex + 1) / statusSteps.length) * 100)}%` }} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {statusSteps.map((status, index) => {
                  const active = index <= activeStepIndex;
                  return (
                    <div key={status} className={active ? 'rounded-md bg-[#342915] p-3 text-[#fff7e8]' : 'rounded-md bg-[#19171d] p-3 text-[#8f7b7d]'}>
                      <div className={active ? 'mb-2 h-2 w-2 rounded-full bg-[#f0c66d]' : 'mb-2 h-2 w-2 rounded-full bg-[#4a4147]'} />
                      <p className="text-xs font-black">{customerStatusLabels[status]}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {['payment_failed', 'cancelled', 'expired'].includes(order.status) ? (
            <Card className="border-[#e8304d] bg-[#241117]">
              <CardContent className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-red-200">Needs attention</p>
                <h2 className="mt-1 text-xl font-black text-[#fff7e8]">{customerStatusLabels[order.status]}</h2>
                <p className="mt-2 text-sm leading-6 text-red-100/80">
                  This order cannot continue in its current state. You can reopen payment or contact support for help.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="danger">
                    <Link href={`/payment?orderId=${order.id}` as never}>Open Payment</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <a href="tel:+14045550192">Call Support</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card id="handoff-progress" className="border-[#342d32] bg-[#1f1d23]">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Handoff Progress</CardTitle>
                <p className="mt-1 text-sm text-[#bca6a7]">Updates from checkout, payment, and order preparation.</p>
              </div>
              <Badge variant="default">Live order</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(order.history.length > 0 ? order.history : statusSteps.map((status, index) => ({
                  id: status,
                  status,
                  label: customerStatusLabels[status],
                  reason: null,
                  actorId: null,
                  createdAt: index <= activeStepIndex ? order.createdAt : order.updatedAt
                }))).map((event, index) => {
                  const active = index <= Math.max(activeStepIndex, order.history.length - 1);
                  return (
                    <div key={event.id} className="grid grid-cols-[28px_1fr_auto] gap-3">
                      <div className="flex flex-col items-center">
                        <span className={active ? 'grid h-7 w-7 place-items-center rounded-full bg-[#f0c66d] text-xs font-black text-[#241404]' : 'grid h-7 w-7 place-items-center rounded-full bg-[#302a31] text-xs font-black text-[#8f7b7d]'}>
                          {index + 1}
                        </span>
                        {index < order.history.length - 1 ? <span className="h-full w-px bg-[#342d32]" /> : null}
                      </div>
                      <div className={active ? 'rounded-lg bg-[#211d23] p-3' : 'rounded-lg bg-[#151319] p-3 opacity-70'}>
                        <p className="text-sm font-black text-[#fff7e8]">{customerStatusLabels[event.status] ?? event.label}</p>
                        <p className="mt-1 text-xs leading-5 text-[#bca6a7]">{event.reason ?? trackingCopy(event.status)}</p>
                      </div>
                      <time className="pt-3 text-right text-xs font-bold text-[#f0c66d]">
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#342d32] bg-[#1f1d23]">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Delivery Handoff</CardTitle>
                <p className="mt-1 text-sm text-[#bca6a7]">Current order details from checkout.</p>
              </div>
              <Badge variant="dark">Handoff</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <InfoBlock label="Recipient" value={order.customer.recipientName ?? order.customer.name} />
              <InfoBlock label="Contact" value={order.customer.phone} />
              <InfoBlock label="Method" value={fulfillmentLabel} />
              <InfoBlock label="Window" value={deliveryWindow || (order.reservationExpiresAt ? `Reserved until ${new Date(order.reservationExpiresAt).toLocaleTimeString()}` : 'Window not captured yet')} />
              <InfoBlock label="Delivery address" value={deliveryAddress} wide />
              <InfoBlock label="Handoff instructions" value={order.customer.handoffInstructions ?? 'No handoff note added yet.'} wide />
              <InfoBlock label="Courier tracking" value="Courier assignment and live map are not captured yet." wide />
            </CardContent>
          </Card>

          <Card className="border-[#342d32] bg-[#1f1d23]">
            <CardHeader>
              <CardTitle>Items in This Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg bg-[#151319] p-3">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-[#27232a]">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#fff7e8]">{item.productName}</p>
                    <p className="text-xs text-[#bca6a7]">{item.skuName} x {item.quantity}</p>
                  </div>
                  <p className="text-right text-sm font-black text-[#ffd98a]">{formatMoney(item.lineTotalCents, order.currency)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card className="border-[#342d32] bg-[#1f1d23]">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {primaryItem ? (
                <div className="rounded-lg bg-[#151319] p-3">
                  <p className="text-sm font-black text-[#fff7e8]">{primaryItem.productName}</p>
                  <p className="text-xs text-[#bca6a7]">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                </div>
              ) : null}
              <div className="flex items-end justify-between border-t border-[#342d32] pt-4">
                <span className="text-sm text-[#bca6a7]">Total paid</span>
                <strong className="text-2xl text-[#ffd98a]">{formatMoney(order.totalCents, order.currency)}</strong>
              </div>
              <InfoBlock label="Payment" value={latestPayment ? `${customerStatusLabels[latestPayment.status] ?? latestPayment.status} • ${latestPayment.provider}` : 'No payment recorded'} />
              <Button asChild className="w-full">
                <Link href={`/payment?orderId=${order.id}`}>Open Payment</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#342d32] bg-[#151319]">
            <CardContent className="p-5">
              <p className="text-sm font-black text-[#fff7e8]">Need help with this order?</p>
              <p className="mt-2 text-sm text-[#bca6a7]">Call or message support for delivery changes, notes, or payment questions.</p>
              <Button asChild variant="gold" className="mt-4 w-full">
                <a href="tel:+14045550192">Call Support</a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function InfoBlock({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'rounded-lg bg-[#151319] p-3 md:col-span-2' : 'rounded-lg bg-[#151319] p-3'}>
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#f0c66d]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#fff7e8]">{value}</p>
    </div>
  );
}

function CustomerOrderState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <Card className="mx-auto max-w-xl border-[#342d32] bg-[#1f1d23]">
      <CardContent className="p-8 text-center">
        <h1 className="text-2xl font-black text-[#fff7e8]">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#bca6a7]">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild><Link href={primaryHref as never}>{primaryLabel}</Link></Button>
          <Button asChild variant="secondary"><Link href={secondaryHref as never}>{secondaryLabel}</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function displayOrderRef(order: CustomerOrderListItem | CustomerOrderDetail) {
  return order.shortRef ? `#${order.shortRef}` : `#${order.id.slice(0, 8)}`;
}

function fulfillmentMethodLabel(method?: CustomerOrderDetail['customer']['fulfillmentMethod']) {
  const labels: Record<NonNullable<CustomerOrderDetail['customer']['fulfillmentMethod']>, string> = {
    delivery_handoff: 'Delivery handoff',
    store_pickup: 'Store pickup',
    scheduled_delivery: 'Scheduled delivery'
  };

  return method ? labels[method] : 'Delivery handoff';
}

function trackingCopy(status: string) {
  const copy: Record<string, string> = {
    checkout_started: 'Your checkout was started and your order details were saved.',
    payment_pending: 'Payment is the next step before preparation begins.',
    paid: 'Payment is confirmed and the order can move into preparation.',
    preparing: 'The kitchen is preparing and packing your order.',
    ready_for_pickup_dispatch: 'Your order is ready for pickup or delivery handoff.',
    completed: 'Your order has been completed.',
    manual_payment_proof_submitted: 'Your payment details were submitted for review.',
    awaiting_admin_payment_approval: 'Your payment is being reviewed.',
    payment_failed: 'Payment was not confirmed. Please try again or contact support.'
  };

  return copy[status] ?? 'Order status updated.';
}
