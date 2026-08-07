import { apiFetch } from '@/lib/api/client';
import type { AdminAuthResponse, AdminLoginInput } from '@/types/AdminAuth/adminAuthTypes';

export function getAdminCsrf() {
  return apiFetch<{ data: { csrfToken: string } }>('/auth/csrf');
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
  return apiFetch<{ data: { ok: true } }>('/auth/logout', {
    method: 'POST',
    skipAuthRefresh: true
  });
}
