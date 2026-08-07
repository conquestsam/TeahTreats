import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type {
  CustomerAuthResponse,
  CustomerLoginInput,
  CustomerSignupInput
} from '@/types/CustomerAuth/customerAuthTypes';

const tenantHeaders = { 'x-tenant-id': customerTenantId };

export function getCustomerCsrf() {
  return apiFetch<{ data: { csrfToken: string } }>('/customer-auth/csrf', {
    headers: tenantHeaders,
    skipAuthRefresh: true
  });
}

export function signupCustomer(input: CustomerSignupInput) {
  return apiFetch<CustomerAuthResponse>('/customer-auth/signup', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input),
    skipAuthRefresh: true
  }).then((response) => response.data);
}

export function loginCustomer(input: CustomerLoginInput) {
  return apiFetch<CustomerAuthResponse>('/customer-auth/login', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input),
    skipAuthRefresh: true
  }).then((response) => response.data);
}

export function getCurrentCustomer() {
  return apiFetch<CustomerAuthResponse>('/customer-auth/me', {
    headers: tenantHeaders,
    skipAuthRefresh: true
  }).then((response) => response.data);
}

export function logoutCustomer() {
  return apiFetch<{ data: { ok: true } }>('/customer-auth/logout', {
    method: 'POST',
    headers: tenantHeaders,
    skipAuthRefresh: true
  }).then((response) => response.data);
}
