import type {
  AdminRoleChangeApprovalSummary,
  AdminRoleSummary,
  AdminTenantSummary,
  AdminUserSummary
} from '@snacks/shared';
export type {
  AssignAdminUserRoleInput,
  CreateAdminRoleInput,
  CreateAdminUserInput,
  UpdateAdminUserInput
} from '@snacks/shared';

export type AdminUserModel = AdminUserSummary;
export type AdminRoleModel = AdminRoleSummary;
export type AdminTenantModel = AdminTenantSummary;
export type AdminApprovalModel = AdminRoleChangeApprovalSummary;

export type AdminUserModalMode =
  | 'closed'
  | 'create-user'
  | 'edit-user'
  | 'assign-role'
  | 'remove-role'
  | 'create-role'
  | 'approve'
  | 'reject';
