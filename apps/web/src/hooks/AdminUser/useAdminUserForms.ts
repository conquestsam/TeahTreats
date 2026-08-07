'use client';

import { useForm } from '@mantine/form';
import {
  adminRoleAssignmentInitialValues,
  adminRoleInitialValues,
  adminUserInitialValues
} from '@/constants/AdminUser/adminUserConstants';
import {
  adminRoleAssignmentSchema,
  adminRoleSchema,
  adminUserEditSchema,
  adminUserSchema,
  validateWithSchema,
  type AdminRoleAssignmentFormValues,
  type AdminRoleFormValues,
  type AdminUserEditFormValues,
  type AdminUserFormValues
} from '@/validation/AdminUser/adminUserValidation';

export function useAdminUserForm() {
  return useForm<AdminUserFormValues>({
    initialValues: adminUserInitialValues,
    validate: (values) => validateWithSchema(adminUserSchema, values),
    validateInputOnBlur: true
  });
}

export function useAdminUserEditForm() {
  return useForm<AdminUserEditFormValues>({
    initialValues: { name: '', phone: '' },
    validate: (values) => validateWithSchema(adminUserEditSchema, values),
    validateInputOnBlur: true
  });
}

export function useAdminRoleAssignmentForm() {
  return useForm<AdminRoleAssignmentFormValues>({
    initialValues: adminRoleAssignmentInitialValues,
    validate: (values) => validateWithSchema(adminRoleAssignmentSchema, values),
    validateInputOnBlur: true
  });
}

export function useAdminRoleForm() {
  return useForm<AdminRoleFormValues>({
    initialValues: adminRoleInitialValues,
    validate: (values) => validateWithSchema(adminRoleSchema, values),
    validateInputOnBlur: true
  });
}
