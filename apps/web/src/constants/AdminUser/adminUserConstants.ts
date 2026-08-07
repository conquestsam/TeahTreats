export const adminUserQueryKey = ['admin-users'] as const;
export const adminRoleQueryKey = ['admin-roles'] as const;
export const adminPermissionQueryKey = ['admin-permissions'] as const;
export const adminTenantQueryKey = ['admin-tenants'] as const;
export const adminApprovalQueryKey = ['admin-approvals'] as const;

export const adminUserInitialValues = {
  email: '',
  name: '',
  phone: '',
  temporaryPassword: ''
};

export const adminRoleAssignmentInitialValues = {
  roleId: '',
  tenantId: '',
  reason: ''
};

export const adminRoleInitialValues = {
  name: '',
  permissions: [] as string[]
};
