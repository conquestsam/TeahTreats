'use client';

import { useState } from 'react';
import type {
  AdminApprovalModel,
  AdminUserModalMode,
  AdminUserModel,
  AdminUserModel as AdminUserRoleOwner
} from '@/types/AdminUser/adminUserTypes';

export function useAdminUserModals() {
  const [mode, setMode] = useState<AdminUserModalMode>('closed');
  const [selectedUser, setSelectedUser] = useState<AdminUserModel | null>(null);
  const [selectedUserRole, setSelectedUserRole] =
    useState<AdminUserRoleOwner['roles'][number] | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<AdminApprovalModel | null>(null);

  const closeModal = () => {
    setMode('closed');
    setSelectedUser(null);
    setSelectedUserRole(null);
    setSelectedApproval(null);
  };

  return {
    mode,
    selectedUser,
    selectedUserRole,
    selectedApproval,
    openCreateUser: () => setMode('create-user'),
    openCreateRole: () => setMode('create-role'),
    openEditUser: (user: AdminUserModel) => {
      setSelectedUser(user);
      setMode('edit-user');
    },
    openAssignRole: (user: AdminUserModel) => {
      setSelectedUser(user);
      setMode('assign-role');
    },
    openRemoveRole: (user: AdminUserModel, userRole: AdminUserRoleOwner['roles'][number]) => {
      setSelectedUser(user);
      setSelectedUserRole(userRole);
      setMode('remove-role');
    },
    openApprove: (approval: AdminApprovalModel) => {
      setSelectedApproval(approval);
      setMode('approve');
    },
    openReject: (approval: AdminApprovalModel) => {
      setSelectedApproval(approval);
      setMode('reject');
    },
    closeModal
  };
}
