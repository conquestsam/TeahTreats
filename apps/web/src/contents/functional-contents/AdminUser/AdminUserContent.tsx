'use client';

import { SimpleGrid, Stack } from '@mantine/core';
import { AdminApprovalList } from '@/components/functional-components/AdminUser/AdminApprovalList';
import { useMemo } from 'react';
import { AdminRoleAssignmentModal } from '@/components/functional-components/AdminUser/AdminRoleAssignmentModal';
import { AdminRoleFormModal } from '@/components/functional-components/AdminUser/AdminRoleFormModal';
import { AdminUserConfirmModal } from '@/components/functional-components/AdminUser/AdminUserConfirmModal';
import { AdminUserFormModal } from '@/components/functional-components/AdminUser/AdminUserFormModal';

import { AdminUserTable } from '@/components/functional-components/AdminUser/AdminUserTable';
import {
  useAdminRoleAssignmentForm,
  useAdminRoleForm,
  useAdminUserForm
} from '@/hooks/AdminUser/useAdminUserForms';
import { useAdminUserModals } from '@/hooks/AdminUser/useAdminUserModals';
import { useAdminUserMutations } from '@/hooks/AdminUser/useAdminUserMutations';
import {
  useAdminApprovalQuery,
  useAdminPermissionQuery,
  useAdminRoleQuery,
  useAdminTenantQuery,
  useAdminUserQuery
} from '@/hooks/AdminUser/useAdminUserQuery';
import type { AdminUserModel } from '@/types/AdminUser/adminUserTypes';
import { MetricCard } from '@/components/ui/metric-card';
import { AdminUserEmptyState } from './AdminUserEmptyState';
import { AdminUserHeader } from './AdminUserHeader';
import { AdminUserLoadingState } from './AdminUserLoadingState';

export function AdminUserContent() {
  const modals = useAdminUserModals();
  const usersQuery = useAdminUserQuery();
  const rolesQuery = useAdminRoleQuery();
  const tenantsQuery = useAdminTenantQuery();
  const permissionsQuery = useAdminPermissionQuery();
  const approvalsQuery = useAdminApprovalQuery();
  const userForm = useAdminUserForm();
  const roleAssignmentForm = useAdminRoleAssignmentForm();
  const roleForm = useAdminRoleForm();

  const resetAndClose = () => {
    userForm.reset();
    roleAssignmentForm.reset();
    roleForm.reset();
    modals.closeModal();
  };

  const mutations = useAdminUserMutations(resetAndClose);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const roles = rolesQuery.data ?? [];
  const tenants = tenantsQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const approvals = approvalsQuery.data ?? [];

  const openCreateUser = () => {
    userForm.reset();
    modals.openCreateUser();
  };

  const openCreateRole = () => {
    roleForm.reset();
    modals.openCreateRole();
  };

  const openEditUser = (user: AdminUserModel) => {
    userForm.setValues({
      email: user.email,
      name: user.name,
      phone: user.phone ?? '',
      temporaryPassword: ''
    });
    modals.openEditUser(user);
  };

  const openAssignRole = (user: AdminUserModel) => {
    roleAssignmentForm.setValues({
      roleId: roles[0]?.id ?? '',
      tenantId: tenants[0]?.id ?? '',
      reason: ''
    });
    modals.openAssignRole(user);
  };

  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <AdminUserHeader onCreateUser={openCreateUser} onCreateRole={openCreateRole} />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard label="Users" value={users.length} hint="Admin and tenant users" tone="green" />
          <MetricCard label="Roles" value={roles.length} hint="Delegatable access" tone="blue" />
          <MetricCard label="Permissions" value={permissions.length} hint="Scoped controls" tone="gray" />
          <MetricCard label="Approvals" value={approvals.length} hint="Pending review queue" tone="orange" />
        </SimpleGrid>

        <AdminApprovalList
          approvals={approvals}
          onApprove={modals.openApprove}
          onReject={modals.openReject}
        />

        {usersQuery.isLoading ? (
          <AdminUserLoadingState />
        ) : users.length === 0 ? (
          <AdminUserEmptyState />
        ) : (
          <div style={{ overflowX: 'auto' }}>
              <AdminUserTable
                users={users}
                onEdit={openEditUser}
                onAssignRole={openAssignRole}
                onRemoveRole={modals.openRemoveRole}
              />
          </div>
        )}
      </Stack>

      <AdminUserFormModal
        mode="create"
        opened={modals.mode === 'create-user'}
        loading={mutations.createUserMutation.isPending}
        form={userForm}
        onClose={resetAndClose}
        onSubmit={() =>
          mutations.createUserMutation.mutate({
            email: userForm.values.email,
            name: userForm.values.name,
            ...(userForm.values.phone ? { phone: userForm.values.phone } : {}),
            ...(userForm.values.temporaryPassword
              ? { temporaryPassword: userForm.values.temporaryPassword }
              : {})
          })
        }
      />

      <AdminUserFormModal
        mode="edit"
        opened={modals.mode === 'edit-user'}
        loading={mutations.updateUserMutation.isPending}
        form={userForm}
        onClose={resetAndClose}
        onSubmit={() => {
          if (modals.selectedUser) {
            mutations.updateUserMutation.mutate({
              userId: modals.selectedUser.id,
              user: {
                name: userForm.values.name,
                ...(userForm.values.phone ? { phone: userForm.values.phone } : {})
              }
            });
          }
        }}
      />

      <AdminRoleAssignmentModal
        opened={modals.mode === 'assign-role'}
        loading={mutations.assignRoleMutation.isPending}
        roles={roles}
        tenants={tenants}
        form={roleAssignmentForm}
        onClose={resetAndClose}
        onSubmit={() => {
          if (modals.selectedUser) {
            mutations.assignRoleMutation.mutate({
              userId: modals.selectedUser.id,
              assignment: {
                roleId: roleAssignmentForm.values.roleId,
                tenantId: roleAssignmentForm.values.tenantId,
                ...(roleAssignmentForm.values.reason ? { reason: roleAssignmentForm.values.reason } : {})
              }
            });
          }
        }}
      />

      <AdminRoleFormModal
        opened={modals.mode === 'create-role'}
        loading={mutations.createRoleMutation.isPending}
        permissions={permissions}
        form={roleForm}
        onClose={resetAndClose}
        onSubmit={() => mutations.createRoleMutation.mutate(roleForm.values)}
      />

      <AdminUserConfirmModal
        opened={modals.mode === 'remove-role'}
        title="Remove Role"
        body={`Remove ${modals.selectedUserRole?.roleName ?? 'this role'} from ${
          modals.selectedUser?.name ?? 'this user'
        }?`}
        confirmLabel="Remove"
        color="red"
        loading={mutations.removeRoleMutation.isPending}
        onClose={resetAndClose}
        onConfirm={() => {
          if (modals.selectedUser && modals.selectedUserRole) {
            mutations.removeRoleMutation.mutate({
              userId: modals.selectedUser.id,
              userRoleId: modals.selectedUserRole.id
            });
          }
        }}
      />

      <AdminUserConfirmModal
        opened={modals.mode === 'approve'}
        title="Approve Role"
        body={`Approve ${modals.selectedApproval?.roleName ?? 'this role'} for ${
          modals.selectedApproval?.targetUserName ?? 'this user'
        }?`}
        confirmLabel="Approve"
        loading={mutations.approveMutation.isPending}
        onClose={resetAndClose}
        onConfirm={() => {
          if (modals.selectedApproval) {
            mutations.approveMutation.mutate(modals.selectedApproval.id);
          }
        }}
      />

      <AdminUserConfirmModal
        opened={modals.mode === 'reject'}
        title="Reject Role"
        body={`Reject ${modals.selectedApproval?.roleName ?? 'this role'} for ${
          modals.selectedApproval?.targetUserName ?? 'this user'
        }?`}
        confirmLabel="Reject"
        color="red"
        askReason
        loading={mutations.rejectMutation.isPending}
        onClose={resetAndClose}
        onConfirm={(reason) => {
          if (modals.selectedApproval) {
            mutations.rejectMutation.mutate({
              approvalId: modals.selectedApproval.id,
              ...(reason ? { reason } : {})
            });
          }
        }}
      />
    </div>
  );
}
