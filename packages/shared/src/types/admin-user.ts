import type { Permission } from '../permissions/index.js';

export type RoleChangeApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AdminTenantSummary {
  id: string;
  name: string;
  slug: string;
  delegatedRoleApprovalRequired: boolean;
}

export interface AdminRoleSummary {
  id: string;
  name: string;
  tenantId: string | null;
  permissions: Permission[];
}

export interface AdminUserRoleSummary {
  id: string;
  roleId: string;
  roleName: string;
  tenantId: string | null;
  tenantName: string | null;
  permissions: Permission[];
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  deletedAt: string | null;
  createdAt: string;
  roles: AdminUserRoleSummary[];
}

export interface AdminRoleChangeApprovalSummary {
  id: string;
  tenantId: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  roleId: string;
  roleName: string;
  action: string;
  status: RoleChangeApprovalStatus;
  requestedByName: string;
  reason: string | null;
  createdAt: string;
}
