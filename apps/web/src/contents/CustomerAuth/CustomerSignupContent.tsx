'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TeahTreatsAuthShell } from '@/components/Auth/TeahTreatsAuthShell';
import { CustomerSignupForm } from '@/components/CustomerAuth/CustomerSignupForm';
import { useCustomerSignupForm } from '@/hooks/CustomerAuth/useCustomerAuthForm';
import { useCustomerSignupMutation } from '@/hooks/CustomerAuth/useCustomerAuthMutations';
import { useCurrentCustomerQuery, useCustomerCsrfQuery } from '@/hooks/CustomerAuth/useCustomerAuthQuery';
import { authRedirects } from '@/lib/auth/auth-routes';
import { redirectOnce } from '@/lib/auth/auth-errors';

export function CustomerSignupContent() {
  const searchParams = useSearchParams();
  const claimOrderId = searchParams.get('claimOrderId');
  useCustomerCsrfQuery();
  const form = useCustomerSignupForm();
  const signupMutation = useCustomerSignupMutation({
    claimOrderId,
    redirectTo: claimOrderId ? `/orders/${claimOrderId}` : authRedirects.customerAfterLogin
  });
  const currentCustomerQuery = useCurrentCustomerQuery();

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
      const parsed = JSON.parse(raw) as { email?: string; phone?: string; name?: string };
      if (parsed.name && !form.values.name) {
        form.setFieldValue('name', parsed.name);
      }
      if (parsed.email && !form.values.email) {
        form.setFieldValue('email', parsed.email);
      }
      if (parsed.phone && !form.values.phone) {
        form.setFieldValue('phone', parsed.phone);
      }
    } catch {
      window.sessionStorage.removeItem(`teahTreats.checkout.${claimOrderId}`);
    }
  }, [claimOrderId, form]);

  return (
    <TeahTreatsAuthShell
      eyebrow="Create account"
      title="Join TeahTreats"
      description="Save your details, reorder faster, and keep your favorite snacks close."
      footerNote="Your account helps us prepare repeat orders faster."
    >
      <CustomerSignupForm
        form={form}
        loading={signupMutation.isPending}
        claimOrderId={claimOrderId}
        onSubmit={(values) => signupMutation.mutate(values)}
      />
    </TeahTreatsAuthShell>
  );
}
