import { apiFetch } from '@/lib/api/client';
import type {
  AdminTenantInput,
  AdminTenantModel,
  DeactivateTenantInput,
  ReactivateTenantInput
} from '@/types/AdminTenant/adminTenantTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listAdminTenants() {
  return apiFetch<ApiEnvelope<AdminTenantModel[]>>('/admin/tenants').then((response) => response.data);
}

export function createAdminTenant(input: AdminTenantInput) {
  return apiFetch<ApiEnvelope<AdminTenantModel>>('/admin/tenants', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminTenant(tenantId: string, input: Partial<AdminTenantInput>) {
  return apiFetch<ApiEnvelope<AdminTenantModel>>(`/admin/tenants/${tenantId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function deactivateAdminTenant(tenantId: string, input: DeactivateTenantInput) {
  return apiFetch<ApiEnvelope<AdminTenantModel>>(`/admin/tenants/${tenantId}/deactivate`, {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function reactivateAdminTenant(tenantId: string, input: ReactivateTenantInput = {}) {
  return apiFetch<ApiEnvelope<AdminTenantModel>>(`/admin/tenants/${tenantId}/reactivate`, {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
