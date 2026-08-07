import { apiFetch } from '@/lib/api/client';
import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import type {
  CheckoutCustomerInput,
  CheckoutStartedModel,
  CustomerCouponPreviewModel,
  CustomerCartModel
} from '@/types/CustomerCart/customerCartTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

const tenantHeaders = {
  'x-tenant-id': customerTenantId
};

export function getCustomerCart() {
  return apiFetch<ApiEnvelope<CustomerCartModel>>('/shop/cart', {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function updateCustomerCartItem(itemId: string, quantity: number) {
  return apiFetch<ApiEnvelope<CustomerCartModel>>(`/shop/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: tenantHeaders,
    body: JSON.stringify({ quantity })
  }).then((response) => response.data);
}

export function removeCustomerCartItem(itemId: string) {
  return apiFetch<ApiEnvelope<CustomerCartModel>>(`/shop/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function startCustomerCheckout(input: CheckoutCustomerInput) {
  return apiFetch<ApiEnvelope<CheckoutStartedModel>>('/shop/checkout/start', {
    method: 'POST',
    headers: {
      ...tenantHeaders,
      'idempotency-key': crypto.randomUUID()
    },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function validateCustomerCoupon(input: { code: string; email?: string }) {
  return apiFetch<ApiEnvelope<CustomerCouponPreviewModel>>('/shop/promotions/validate-coupon', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
