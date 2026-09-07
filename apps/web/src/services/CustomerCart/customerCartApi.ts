import { apiFetch } from '@/lib/api/client';
import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import type {
  ApiEnvelope,
  CheckoutCustomerInput,
  CheckoutStartedSummary,
  CouponValidationSummary,
  CustomerCartSummary,
  CustomerFulfillmentMethod,
  DeliverySlot,
  ValidateCouponInput
} from '@snacks/shared';

const tenantHeaders = {
  'x-tenant-id': customerTenantId
};

export function getCustomerCart() {
  return apiFetch<ApiEnvelope<CustomerCartSummary>>('/shop/cart', {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function updateCustomerCartItem(itemId: string, quantity: number) {
  return apiFetch<ApiEnvelope<CustomerCartSummary>>(`/shop/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: tenantHeaders,
    body: JSON.stringify({ quantity })
  }).then((response) => response.data);
}

export function removeCustomerCartItem(itemId: string) {
  return apiFetch<ApiEnvelope<CustomerCartSummary>>(`/shop/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function startCustomerCheckout(input: CheckoutCustomerInput) {
  return apiFetch<ApiEnvelope<CheckoutStartedSummary>>('/shop/checkout/start', {
    method: 'POST',
    headers: {
      ...tenantHeaders,
      'idempotency-key': crypto.randomUUID()
    },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function listCustomerDeliverySlots(method?: CustomerFulfillmentMethod) {
  const query = method ? `?method=${encodeURIComponent(method)}` : '';
  return apiFetch<ApiEnvelope<DeliverySlot[]>>(`/shop/checkout/delivery-slots${query}`, {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function validateCustomerCoupon(input: ValidateCouponInput) {
  return apiFetch<ApiEnvelope<CouponValidationSummary>>('/shop/promotions/validate-coupon', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
