'use client';

import { useState } from 'react';
import { CustomerCartConfirmModal } from '@/components/functional-components/CustomerCart/CustomerCartConfirmModal';
import { CustomerCheckoutAuthModal } from '@/components/functional-components/CustomerCart/CustomerCheckoutAuthModal';
import { CustomerCartItems } from '@/components/functional-components/CustomerCart/CustomerCartItems';
import { CustomerCheckoutModal } from '@/components/functional-components/CustomerCart/CustomerCheckoutModal';
import { CustomerCheckoutSummary } from '@/components/functional-components/CustomerCart/CustomerCheckoutSummary';
import { GroupCartDrawer } from '@/components/functional-components/GroupCart/GroupCartDrawer';
import { useCurrentCustomerQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { useCustomerCheckoutForm } from '@/hooks/CustomerCart/useCustomerCartForm';
import { useCustomerCartModals } from '@/hooks/CustomerCart/useCustomerCartModals';
import { useCustomerCartMutations } from '@/hooks/CustomerCart/useCustomerCartMutations';
import { useCustomerCartQuery } from '@/hooks/CustomerCart/useCustomerCartQuery';
import type { CheckoutStartedModel, CustomerCouponPreviewModel } from '@/types/CustomerCart/customerCartTypes';

export function CustomerCartContent() {
  const cartQuery = useCustomerCartQuery();
  const currentCustomerQuery = useCurrentCustomerQuery();
  const modals = useCustomerCartModals();
  const checkoutForm = useCustomerCheckoutForm();
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutStartedModel | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState<CustomerCouponPreviewModel | null>(null);
  const [groupCartOpened, setGroupCartOpened] = useState(false);
  const mutations = useCustomerCartMutations(modals.closeModal);
  const cart = cartQuery.data;
  const activeDiscount = couponPreview?.valid ? couponPreview : null;
  const displaySubtotal = activeDiscount?.subtotalCents ?? cart?.subtotalCents ?? cart?.totalCents ?? 0;
  const displayDiscount = activeDiscount?.discountCents ?? cart?.discountCents ?? 0;
  const displayTotal = activeDiscount?.totalCents ?? cart?.totalCents ?? 0;

  return (
    <div>
      {/* Page header */}
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <p className="tt-eyebrow" style={{ marginBottom: 10 }}>Checkout</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: 10 }}>
            Your snack cart
          </h1>
          <p className="tt-body" style={{ maxWidth: 560 }}>
            Review quantities before checkout starts inventory reservation. Totals are recalculated on the backend.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20 }}>
              {cart?.items.length ? `${cart.items.length} items` : 'Empty'}
            </span>
            <a href="/products" className="tt-btn-secondary" style={{
              display: 'inline-flex', padding: '8px 18px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.82rem'
            }}>
              Browse Snacks
            </a>
          </div>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        {checkoutSummary && <CustomerCheckoutSummary checkout={checkoutSummary} />}

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
              Add snacks before checkout. Fresh items are checked again when you reserve inventory.
            </p>
            <a href="/products" className="tt-btn-primary" style={{
              display: 'inline-flex', padding: '10px 22px', borderRadius: 8,
              textDecoration: 'none', fontSize: '0.85rem'
            }}>
              Browse Snacks
            </a>
          </div>
        ) : (
          <div className="cart-grid" style={{
            display: 'grid', gap: 28, gridTemplateColumns: '1fr', alignItems: 'start'
          }}>
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
            <div className="tt-panel-elevated" style={{ padding: 28, position: 'sticky', top: 100, borderRadius: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--tt-cream)', fontSize: '1rem' }}>Cart total</span>
                  <span className="tt-badge-gold" style={{ padding: '3px 10px', borderRadius: 20 }}>Backend total</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--tt-cream-dim)' }}>Subtotal</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--tt-cream)' }}>${(displaySubtotal / 100).toFixed(2)}</span>
                  </div>
                  {displayDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>Discount</span>
                      <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>-${(displayDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <p style={{
                  fontFamily: 'var(--tt-font-editorial)', fontWeight: 700,
                  fontSize: '2.2rem', color: 'var(--tt-gold-light)', margin: 0
                }}>
                  ${(displayTotal / 100).toFixed(2)}
                </p>

                {/* Coupon */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    <p style={{ fontSize: '0.78rem', color: '#f87171', margin: 0 }}>{couponPreview.message}</p>
                  )}
                  <button
                    className="tt-btn-secondary"
                    disabled={!couponCode.trim() || mutations.couponMutation.isPending}
                    onClick={() =>
                      mutations.couponMutation.mutate(
                        { code: couponCode },
                        { onSuccess: (preview) => setCouponPreview(preview) }
                      )
                    }
                    style={{ padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', width: '100%' }}
                  >
                    {mutations.couponMutation.isPending ? 'Checking...' : 'Apply Coupon'}
                  </button>
                </div>

                {activeDiscount?.discountLines.map((line) => (
                  <p key={`${line.code}-${line.label}`} style={{ fontSize: '0.82rem', color: '#4ade80', margin: 0 }}>
                    {line.label}: -${(line.amountCents / 100).toFixed(2)}
                  </p>
                ))}

                <p style={{ fontSize: '0.78rem', color: 'var(--tt-cream-dim)' }}>
                  Checkout will reserve sellable, non-expired inventory before payment.
                </p>

                <button
                  className="tt-btn-primary"
                  onClick={() => {
                    if (currentCustomerQuery.data) {
                      checkoutForm.setValues({
                        name: currentCustomerQuery.data.name || '',
                        email: currentCustomerQuery.data.email || '',
                        phone: checkoutForm.values.phone || '',
                        address: checkoutForm.values.address || ''
                      });
                      modals.openCheckout();
                    } else {
                      modals.openAuth();
                    }
                  }}
                  style={{ padding: '14px 22px', borderRadius: 10, cursor: 'pointer', fontSize: '0.95rem', width: '100%' }}
                >
                  Start Checkout
                </button>

                <button
                  className="tt-btn-secondary"
                  onClick={() => setGroupCartOpened(true)}
                  style={{ padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', width: '100%' }}
                >
                  Group Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CustomerCheckoutAuthModal opened={modals.mode === 'auth'} onClose={modals.closeModal} />
      <GroupCartDrawer opened={groupCartOpened} cart={cart} onClose={() => setGroupCartOpened(false)} />

      <CustomerCheckoutModal
        opened={modals.mode === 'checkout'}
        loading={mutations.checkoutMutation.isPending}
        form={checkoutForm}
        currentUser={currentCustomerQuery.data}
        onClose={modals.closeModal}
        onSubmit={() =>
          mutations.checkoutMutation.mutate({ ...checkoutForm.values, ...(activeDiscount?.code ? { couponCode: activeDiscount.code } : {}) }, {
            onSuccess: (checkout) => {
              setCheckoutSummary(checkout);
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

      <style>{`
        @media (min-width: 1024px) {
          .cart-grid {
            grid-template-columns: 1.6fr 0.95fr !important;
          }
        }
      `}</style>
    </div>
  );
}
