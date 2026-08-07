import type {
  AdminRoleChangeApprovalSummary,
  AdminRoleSummary,
  AdminTenantSummary,
  AdminUserSummary
} from '@snacks/shared';

export type AdminUserModel = AdminUserSummary;
export type AdminRoleModel = AdminRoleSummary;
export type AdminTenantModel = AdminTenantSummary;
export type AdminApprovalModel = AdminRoleChangeApprovalSummary;

export interface CreateAdminUserInput {
  email: string;
  name: string;
  phone?: string;
  temporaryPassword?: string;
}

export interface UpdateAdminUserInput {
  name: string;
  phone?: string;
}

export interface CreateAdminRoleInput {
  name: string;
  permissions: string[];
}

export interface AssignAdminUserRoleInput {
  roleId: string;
  tenantId: string;
  reason?: string;
}

export type AdminUserModalMode =
  | 'closed'
  | 'create-user'
  | 'edit-user'
  | 'assign-role'
  | 'remove-role'
  | 'create-role'
  | 'approve'
  | 'reject';
