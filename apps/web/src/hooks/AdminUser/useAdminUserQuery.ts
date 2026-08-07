'use client';

import { useQuery } from '@tanstack/react-query';
import {
  adminApprovalQueryKey,
  adminPermissionQueryKey,
  adminRoleQueryKey,
  adminTenantQueryKey,
  adminUserQueryKey
} from '@/constants/AdminUser/adminUserConstants';
import {
  listAdminApprovals,
  listAdminPermissions,
  listAdminRoles,
  listAdminTenants,
  listAdminUsers
} from '@/services/AdminUser/adminUserApi';

export function useAdminUserQuery() {
  return useQuery({ queryKey: adminUserQueryKey, queryFn: listAdminUsers });
}

export function useAdminRoleQuery() {
  return useQuery({ queryKey: adminRoleQueryKey, queryFn: listAdminRoles });
}

export function useAdminPermissionQuery() {
  return useQuery({ queryKey: adminPermissionQueryKey, queryFn: listAdminPermissions });
}

export function useAdminTenantQuery() {
  return useQuery({ queryKey: adminTenantQueryKey, queryFn: listAdminTenants });
}

export function useAdminApprovalQuery() {
  return useQuery({ queryKey: adminApprovalQueryKey, queryFn: listAdminApprovals });
}
