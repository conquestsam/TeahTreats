import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { temporaryTenantId } from '@/lib/api/client';
import { apiFetch } from '@/lib/api/client';
import type {
  CustomerAuthResponse,
  CustomerLoginInput,
  CustomerSignupInput,
  CsrfResponse,
  LogoutResponse
} from '@snacks/shared';

const tenantHeaders = { 'x-tenant-id': customerTenantId };
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export function getCustomerCsrf() {
  return apiFetch<CsrfResponse>('/customer-auth/csrf', {
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
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function logoutCustomer() {
  return apiFetch<LogoutResponse>('/customer-auth/logout', {
    method: 'POST',
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function buildCustomerOAuthStartUrl(provider: 'google', redirectTo = '/account') {
  const url = new URL(`${apiBaseUrl}/customer-auth/oauth/${provider}/start`);
  url.searchParams.set('redirectTo', redirectTo);
  url.searchParams.set('tenant', temporaryTenantId ?? customerTenantId);
  return url.toString();
}
