'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminApprovalQueryKey,
  adminRoleQueryKey,
  adminUserQueryKey
} from '@/constants/AdminUser/adminUserConstants';
import {
  approveAdminRoleChange,
  assignAdminUserRole,
  createAdminRole,
  createAdminUser,
  rejectAdminRoleChange,
  removeAdminUserRole,
  updateAdminUser
} from '@/services/AdminUser/adminUserApi';
import type {
  AssignAdminUserRoleInput,
  CreateAdminRoleInput,
  CreateAdminUserInput,
  UpdateAdminUserInput
} from '@/types/AdminUser/adminUserTypes';

function success(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useAdminUserMutations(onDone: () => void) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminUserQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminRoleQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminApprovalQueryKey })
    ]);
  };

  const createUserMutation = useMutation({
    mutationFn: (input: CreateAdminUserInput) => createAdminUser(input),
    onSuccess: async () => {
      await refresh();
      success('User created.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not create user.')
  });

  const updateUserMutation = useMutation({
    mutationFn: (input: { userId: string; user: UpdateAdminUserInput }) =>
      updateAdminUser(input.userId, input.user),
    onSuccess: async () => {
      await refresh();
      success('User updated.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not update user.')
  });

  const createRoleMutation = useMutation({
    mutationFn: (input: CreateAdminRoleInput) => createAdminRole(input),
    onSuccess: async () => {
      await refresh();
      success('Role created.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not create role.')
  });

  const assignRoleMutation = useMutation({
    mutationFn: (input: { userId: string; assignment: AssignAdminUserRoleInput }) =>
      assignAdminUserRole(input.userId, input.assignment),
    onSuccess: async (result) => {
      await refresh();
      success(result.approval ? 'Approval requested.' : 'Role assigned.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not assign role.')
  });

  const removeRoleMutation = useMutation({
    mutationFn: (input: { userId: string; userRoleId: string }) =>
      removeAdminUserRole(input.userId, input.userRoleId),
    onSuccess: async () => {
      await refresh();
      success('Role removed.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not remove role.')
  });

  const approveMutation = useMutation({
    mutationFn: approveAdminRoleChange,
    onSuccess: async () => {
      await refresh();
      success('Approval accepted.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not approve request.')
  });

  const rejectMutation = useMutation({
    mutationFn: (input: { approvalId: string; reason?: string }) =>
      rejectAdminRoleChange(input.approvalId, input.reason),
    onSuccess: async () => {
      await refresh();
      success('Approval rejected.');
      onDone();
    },
    onError: (error) => fail(error, 'Could not reject request.')
  });

  return {
    createUserMutation,
    updateUserMutation,
    createRoleMutation,
    assignRoleMutation,
    removeRoleMutation,
    approveMutation,
    rejectMutation
  };
}
