'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TeahTreatsAuthShell } from '@/components/Auth/TeahTreatsAuthShell';
import { CustomerLoginForm } from '@/components/CustomerAuth/CustomerLoginForm';
import { useCustomerLoginForm } from '@/hooks/CustomerAuth/useCustomerAuthForm';
import { useCustomerLoginMutation } from '@/hooks/CustomerAuth/useCustomerAuthMutations';
import { useCurrentCustomerQuery, useCustomerCsrfQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { authRedirects } from '@/lib/auth/auth-routes';
import { redirectOnce } from '@/lib/auth/auth-errors';

export function CustomerLoginContent() {
  const searchParams = useSearchParams();
  const claimOrderId = searchParams.get('claimOrderId');
  useCustomerCsrfQuery();
  const form = useCustomerLoginForm();
  const loginMutation = useCustomerLoginMutation({
    claimOrderId,
    redirectTo: claimOrderId ? `/orders/${claimOrderId}` : authRedirects.customerAfterLogin
  });
  const currentCustomerQuery = useCurrentCustomerQuery(true);

  useEffect(() => {
    if (currentCustomerQuery.data) {
      redirectOnce(claimOrderId ? `/orders/${claimOrderId}` : authRedirects.customerAfterLogin);
    }
  }, [claimOrderId, currentCustomerQuery.data]);

  useEffect(() => {
    if (!claimOrderId || typeof window === 'undefined') {
      return;
    }
    const raw = window.sessionStorage.getItem(`teahTreats.checkout.${claimOrderId}`);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { email?: string };
      if (parsed.email && !form.values.email) {
        form.setFieldValue('email', parsed.email);
      }
    } catch {
      window.sessionStorage.removeItem(`teahTreats.checkout.${claimOrderId}`);
    }
  }, [claimOrderId, form]);

  return (
    <TeahTreatsAuthShell
      eyebrow="Customer access"
      title="Sign in to your account"
      description="Track orders, save favorites, and continue checkout with your TeahTreats details ready."
      footerNote="Ordering for an event? You can still continue as a guest from checkout."
    >
      <CustomerLoginForm
        form={form}
        loading={loginMutation.isPending}
        claimOrderId={claimOrderId}
        onSubmit={(values) => loginMutation.mutate(values)}
      />
    </TeahTreatsAuthShell>
  );
}
