import { apiFetch } from '@/lib/api/client';
import type { AdminAuthResponse, AdminLoginInput, CsrfResponse, LogoutResponse } from '@snacks/shared';

export function getAdminCsrf() {
  return apiFetch<CsrfResponse>('/auth/csrf');
}

export function loginAdmin(input: AdminLoginInput) {
  return apiFetch<AdminAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuthRefresh: true
  });
}

export function getCurrentAdminUser() {
  return apiFetch<AdminAuthResponse>('/auth/me');
}

export function logoutAdmin() {
  return apiFetch<LogoutResponse>('/auth/logout', {
    method: 'POST'
  });
}
