'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CustomerCartConfirmModal } from '@/components/CustomerCart/CustomerCartConfirmModal';
import { CustomerCheckoutAuthModal } from '@/components/CustomerCart/CustomerCheckoutAuthModal';
import { CustomerCartItems } from '@/components/CustomerCart/CustomerCartItems';
import { CustomerCheckoutModal } from '@/components/CustomerCart/CustomerCheckoutModal';
import { CustomerCheckoutSummary } from '@/components/CustomerCart/CustomerCheckoutSummary';
import { GroupCartDrawer } from '@/components/GroupCart/GroupCartDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useCustomerCheckoutForm } from '@/hooks/CustomerCart/useCustomerCartForm';
import { useCustomerCartModals } from '@/hooks/CustomerCart/useCustomerCartModals';
import { useCustomerCartMutations } from '@/hooks/CustomerCart/useCustomerCartMutations';
import { useCustomerCartQuery } from '@/hooks/CustomerCart/useCustomerCartQuery';
import { formatMoney } from '@/lib/formatters/money';
import type { CheckoutCustomerInput, CheckoutStartedModel, CustomerCouponPreviewModel } from '@/types/CustomerCart/customerCartTypes';
import type { CheckoutCustomerFormValues } from '@/validation/CustomerCart/customerCartValidation';

export function CustomerCartContent() {
  const cartQuery = useCustomerCartQuery();
  const currentCustomerQuery = useCurrentCustomerQuery();
  const modals = useCustomerCartModals();
  const checkoutForm = useCustomerCheckoutForm();
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutStartedModel | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState<CustomerCouponPreviewModel | null>(null);
  const [groupCartOpened, setGroupCartOpened] = useState(false);
  const [checkoutWasGuest, setCheckoutWasGuest] = useState(false);
  const mutations = useCustomerCartMutations(modals.closeModal);
  const cart = cartQuery.data;
  const activeDiscount = couponPreview?.valid ? couponPreview : null;
  const displaySubtotal = activeDiscount?.subtotalCents ?? cart?.subtotalCents ?? cart?.totalCents ?? 0;
  const displayDiscount = activeDiscount?.discountCents ?? cart?.discountCents ?? 0;
  const displayTotal = activeDiscount?.totalCents ?? cart?.totalCents ?? 0;
  const customer = currentCustomerQuery.data;

  const rememberCheckoutContact = (checkout: CheckoutStartedModel) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(
      `teahTreats.checkout.${checkout.orderId}`,
      JSON.stringify({
        orderId: checkout.orderId,
        email: checkout.customer.email,
        phone: checkout.customer.phone,
        name: checkout.customer.name,
        recipientName: checkout.customer.recipientName ?? checkout.customer.name,
        fulfillmentMethod: checkout.customer.fulfillmentMethod ?? 'delivery_handoff',
        deliveryWindowLabel: checkout.customer.deliveryWindowLabel ?? null
      })
    );
  };

  return (
    <div>
      {/* Page header */}
      <div className="bg-[#0b0b0d] border-b border-[#2e2930]">
        <div className="tt-container">
          <div className="py-8 md:py-12">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f0c66d]">Secure checkout</p>
                <h1 className="mt-2 text-4xl font-black text-[#fff7e8] md:text-6xl">Your cart</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#bca6a7]">
                  Review your selections before we reserve fresh inventory for payment and delivery handoff.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{cart?.items.length ? `${cart.items.length} items` : 'Empty'}</Badge>
                <Badge variant={customer ? 'green' : 'dark'}>{customer ? 'Signed in' : 'Guest cart'}</Badge>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/products">Browse Menu</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        {checkoutSummary && <CustomerCheckoutSummary checkout={checkoutSummary} showAccountPrompt={checkoutWasGuest} />}

        {cartQuery.isLoading ? (
          <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--tt-gold-muted)', borderTopColor: 'var(--tt-gold)',
              animation: 'spin 1s linear infinite', margin: '0 auto 20px'
            }} />
            <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>Loading cart...</h3>
            <p className="tt-body" style={{ fontSize: '0.85rem' }}>Checking saved items and current prices.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(184, 147, 62, 0.08)',
              border: '1px solid var(--tt-gold-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontFamily: 'var(--tt-font-editorial)', fontSize: '1.6rem', color: 'var(--tt-gold)'
            }}>T</div>
            <h3 className="tt-editorial" style={{ fontSize: '1.1rem', marginBottom: 8 }}>
              Your cart is empty.
            </h3>
            <p className="tt-body" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
              Add items before checkout. Fresh availability is checked again when your order is held.
            </p>
            <a href="/products" className="tt-btn-primary" style={{
              display: 'inline-flex', padding: '10px 22px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.85rem'
            }}>
              Browse Snacks
            </a>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)] lg:items-start">
            <div>
              <CustomerCartItems
                cart={cart}
                updating={mutations.updateQuantityMutation.isPending}
                onQuantityChange={(itemId, quantity) =>
                  mutations.updateQuantityMutation.mutate({ itemId, quantity })
                }
                onRemove={modals.openRemove}
              />
            </div>

            {/* Summary panel */}
            <Card className="border-[#342d32] bg-[#1f1d23] lg:sticky lg:top-24">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>Order Summary</CardTitle>
                  <p className="mt-1 text-sm text-[#bca6a7]">Prices update from the cart service.</p>
                </div>
                <Badge variant="default">USD</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2 rounded-lg bg-[#151319] p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#bca6a7]">Items subtotal</span>
                    <span className="font-bold text-[#fff7e8]">{formatMoney(displaySubtotal, cart.currency)}</span>
                  </div>
                  {displayDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400">Discount</span>
                      <span className="font-bold text-emerald-400">-{formatMoney(displayDiscount, cart.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#342d32] pt-3">
                    <span className="text-sm font-bold text-[#bca6a7]">Total</span>
                    <span className="text-3xl font-black text-[#ffd98a]">{formatMoney(displayTotal, cart.currency)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    placeholder="WELCOME10"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponPreview(null);
                    }}
                    className="tt-newsletter-input"
                    style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                    aria-label="Coupon code"
                  />
                  {couponPreview && !couponPreview.valid && (
                    <p className="text-xs font-bold text-red-300">{couponPreview.message}</p>
                  )}
                  <Button
                    variant="secondary"
                    disabled={!couponCode.trim() || mutations.couponMutation.isPending}
                    onClick={() =>
                      mutations.couponMutation.mutate(
                        { code: couponCode },
                        { onSuccess: (preview) => setCouponPreview(preview) }
                      )
                    }
                    className="w-full"
                  >
                    {mutations.couponMutation.isPending ? 'Checking...' : 'Apply Coupon'}
                  </Button>
                </div>

                {activeDiscount?.discountLines.map((line) => (
                  <p key={`${line.code}-${line.label}`} className="text-sm font-bold text-emerald-400">
                    {line.label}: -{formatMoney(line.amountCents, cart.currency)}
                  </p>
                ))}

                <p className="text-xs leading-5 text-[#8f7b7d]">
                  Checkout reserves available items for a short window before payment.
                </p>

                <Button
                  onClick={() => {
                    if (customer) {
                      checkoutForm.setFieldValue('name', customer.name || '');
                      checkoutForm.setFieldValue('email', customer.email || '');
                      checkoutForm.setFieldValue('recipientName', checkoutForm.values.recipientName || customer.name || '');
                      modals.openCheckout();
                    } else {
                      modals.openAuth();
                    }
                  }}
                  className="w-full"
                >
                  Start Checkout
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setGroupCartOpened(true)}
                  className="w-full"
                >
                  Group Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CustomerCheckoutAuthModal
        opened={modals.mode === 'auth'}
        onClose={modals.closeModal}
        onContinueAsGuest={() => {
          setCheckoutWasGuest(true);
          modals.openCheckout();
        }}
      />
      <GroupCartDrawer opened={groupCartOpened} cart={cart} onClose={() => setGroupCartOpened(false)} />

      <CustomerCheckoutModal
        opened={modals.mode === 'checkout'}
        loading={mutations.checkoutMutation.isPending}
        form={checkoutForm}
        currentUser={currentCustomerQuery.data}
        onClose={modals.closeModal}
        onSubmit={() =>
          mutations.checkoutMutation.mutate(buildCheckoutPayload(checkoutForm.values, activeDiscount?.code), {
            onSuccess: (checkout) => {
              rememberCheckoutContact(checkout);
              setCheckoutSummary(checkout);
              setCheckoutWasGuest(checkout.isGuestCheckout);
              setCouponPreview(null);
              setCouponCode('');
              checkoutForm.reset();
            }
          })
        }
      />

      <CustomerCartConfirmModal
        opened={modals.mode === 'remove'}
        loading={mutations.removeMutation.isPending}
        itemName={modals.selectedItem?.productName ?? 'this item'}
        onClose={modals.closeModal}
        onConfirm={() => {
          if (modals.selectedItem) {
            mutations.removeMutation.mutate(modals.selectedItem.id);
          }
        }}
      />
    </div>
  );
}

function buildCheckoutPayload(values: CheckoutCustomerFormValues, couponCode?: string): CheckoutCustomerInput {
  const payload: CheckoutCustomerInput = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    address: values.address
  };
  const optionalFields = [
    'fulfillmentMethod',
    'recipientName',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'postalCode',
    'handoffInstructions',
    'deliveryDate',
    'deliveryWindow'
  ] as const;

  optionalFields.forEach((field) => {
    const value = values[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      Object.assign(payload, { [field]: value.trim() });
    }
  });
  if (couponCode) {
    payload.couponCode = couponCode;
  }

  return payload;
}
