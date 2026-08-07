import { apiFetch } from '@/lib/api/client';
import type {
  AdminApprovalModel,
  AdminRoleModel,
  AdminTenantModel,
  AdminUserModel,
  AssignAdminUserRoleInput,
  CreateAdminRoleInput,
  CreateAdminUserInput,
  UpdateAdminUserInput
} from '@/types/AdminUser/adminUserTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listAdminUsers() {
  return apiFetch<ApiEnvelope<AdminUserModel[]>>('/admin/iam/users').then((response) => response.data);
}

export function createAdminUser(input: CreateAdminUserInput) {
  return apiFetch<ApiEnvelope<AdminUserModel>>('/admin/iam/users', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminUser(userId: string, input: UpdateAdminUserInput) {
  return apiFetch<ApiEnvelope<AdminUserModel>>(`/admin/iam/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function listAdminRoles() {
  return apiFetch<ApiEnvelope<AdminRoleModel[]>>('/admin/iam/roles').then((response) => response.data);
}

export function createAdminRole(input: CreateAdminRoleInput) {
  return apiFetch<ApiEnvelope<AdminRoleModel>>('/admin/iam/roles', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function listAdminPermissions() {
  return apiFetch<ApiEnvelope<string[]>>('/admin/iam/permissions').then((response) => response.data);
}

export function listAdminTenants() {
  return apiFetch<ApiEnvelope<AdminTenantModel[]>>('/admin/iam/tenants').then((response) => response.data);
}

export function assignAdminUserRole(userId: string, input: AssignAdminUserRoleInput) {
  return apiFetch<ApiEnvelope<{ approval: AdminApprovalModel | null; userRole: unknown }>>(
    `/admin/iam/users/${userId}/roles`,
    {
      method: 'POST',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}

export function removeAdminUserRole(userId: string, userRoleId: string) {
  return apiFetch<ApiEnvelope<{ ok: true }>>(`/admin/iam/users/${userId}/roles/${userRoleId}`, {
    method: 'DELETE'
  }).then((response) => response.data);
}

export function listAdminApprovals() {
  return apiFetch<ApiEnvelope<AdminApprovalModel[]>>('/admin/iam/approvals').then(
    (response) => response.data,
  );
}

export function approveAdminRoleChange(approvalId: string) {
  return apiFetch<ApiEnvelope<unknown>>(`/admin/iam/approvals/${approvalId}/approve`, {
    method: 'POST'
  }).then((response) => response.data);
}

export function rejectAdminRoleChange(approvalId: string, reason?: string) {
  return apiFetch<ApiEnvelope<AdminApprovalModel>>(`/admin/iam/approvals/${approvalId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }).then((response) => response.data);
}
