import { apiFetch } from '@/lib/api/client';
import type { AdminAuditLogModel, AdminMfaSetupModel } from '@/types/AdminSecurity/adminSecurityTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function setupAdminMfa() {
  return apiFetch<ApiEnvelope<AdminMfaSetupModel>>('/auth/mfa/setup', { method: 'POST' }).then(
    (response) => response.data,
  );
}

export function verifyAdminMfa(code: string) {
  return apiFetch<ApiEnvelope<{ enabled: boolean; verifiedAt: string | null }>>('/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ code })
  }).then((response) => response.data);
}

export function disableAdminMfa(code: string) {
  return apiFetch<ApiEnvelope<{ enabled: boolean }>>('/auth/mfa/disable', {
    method: 'POST',
    body: JSON.stringify({ code })
  }).then((response) => response.data);
}

export function listAdminAuditLogs(kind: string) {
  const query = kind && kind !== 'all' ? `?kind=${encodeURIComponent(kind)}` : '';
  return apiFetch<ApiEnvelope<AdminAuditLogModel[]>>(`/admin/audit/logs${query}`).then(
    (response) => response.data,
  );
}
