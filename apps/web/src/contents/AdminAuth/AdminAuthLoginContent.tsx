'use client';

import { useEffect } from 'react';
import { AdminAuthLoginForm } from '@/components/AdminAuth/AdminAuthLoginForm';
import { TeahTreatsAuthShell } from '@/components/Auth/TeahTreatsAuthShell';
import { useAdminAuthForm } from '@/hooks/AdminAuth/useAdminAuthForm';
import { useAdminLoginMutation } from '@/hooks/AdminAuth/useAdminAuthMutations';
import {
  useAdminCsrfQuery,
  useAdminCurrentUserQuery
} from '@/hooks/AdminAuth/useAdminAuthQuery';
import { authRedirects } from '@/lib/auth/auth-routes';
import type { AdminLoginFormValues } from '@/validation/AdminAuth/adminAuthValidation';

export function AdminAuthLoginContent() {
  useAdminCsrfQuery();
  const form = useAdminAuthForm();
  const loginMutation = useAdminLoginMutation();
  const currentUserQuery = useAdminCurrentUserQuery();

  useEffect(() => {
    if (currentUserQuery.data) {
      window.location.replace(authRedirects.adminAfterLogin);
    }
  }, [currentUserQuery.data]);

  const submit = (values: AdminLoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <TeahTreatsAuthShell
      eyebrow="Team access"
      title="Sign in to manage TeahTreats"
      description="Access orders, products, payments, inventory, and store settings from one calm workspace."
      footerNote="Use only your own team account on shared devices."
    >
      <AdminAuthLoginForm
        form={form}
        loading={loginMutation.isPending}
        onSubmit={submit}
      />
    </TeahTreatsAuthShell>
  );
}
