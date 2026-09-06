'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import { customerAuthQueryKey } from '@/constants/CustomerAuth/customerAuthConstants';
import { authRedirects } from '@/lib/auth/auth-routes';
import { loginCustomer, logoutCustomer, signupCustomer } from '@/services/CustomerAuth/customerAuthApi';
import { claimGuestOrder } from '@/services/CustomerOrder/customerOrderApi';
import type { CustomerLoginInput, CustomerSignupInput } from '@/types/CustomerAuth/customerAuthTypes';

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useCustomerLoginMutation(options?: { claimOrderId?: string | null; onClaimed?: () => void; redirectTo?: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerLoginInput) => loginCustomer(input),
    onSuccess: async (customer) => {
      const claimed = await claimOrderAfterAuth({
        claimOrderId: options?.claimOrderId,
        email: customer.email,
        phone: customer.phone
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerAuthQueryKey }),
        queryClient.invalidateQueries({ queryKey: customerCartQueryKey })
      ]);
      notifications.show({
        color: 'green',
        title: claimed ? 'Signed in and order saved' : 'Signed in',
        message: claimed ? 'Your guest order is now in your account history.' : 'Welcome back.'
      });
      if (claimed) {
        options?.onClaimed?.();
      }
      window.location.replace(options?.redirectTo ?? authRedirects.customerAfterLogin);
    },
    onError: (error) => fail(error, 'Could not sign in.')
  });
}

export function useCustomerSignupMutation(options?: { claimOrderId?: string | null; onClaimed?: () => void; redirectTo?: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerSignupInput) => signupCustomer(input),
    onSuccess: async (customer) => {
      const claimed = await claimOrderAfterAuth({
        claimOrderId: options?.claimOrderId,
        email: customer.email,
        phone: customer.phone
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerAuthQueryKey }),
        queryClient.invalidateQueries({ queryKey: customerCartQueryKey })
      ]);
      notifications.show({
        color: 'green',
        title: claimed ? 'Account created and order saved' : 'Account created',
        message: claimed ? 'Your guest order is now in your account history.' : 'You are signed in.'
      });
      if (claimed) {
        options?.onClaimed?.();
      }
      window.location.replace(options?.redirectTo ?? authRedirects.customerAfterLogin);
    },
    onError: (error) => fail(error, 'Could not create account.')
  });
}

async function claimOrderAfterAuth(input: { claimOrderId?: string | null | undefined; email: string; phone?: string | null | undefined }) {
  if (!input.claimOrderId || typeof window === 'undefined') {
    return false;
  }

  const raw = window.sessionStorage.getItem(`teahTreats.checkout.${input.claimOrderId}`);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as { email?: string; phone?: string };
    const email = parsed.email ?? input.email;
    const phone = parsed.phone ?? input.phone;
    if (!email || !phone) {
      return false;
    }
    await claimGuestOrder({ orderId: input.claimOrderId, email, phone });
    window.sessionStorage.removeItem(`teahTreats.checkout.${input.claimOrderId}`);
    return true;
  } catch {
    return false;
  }
}

export function useCustomerLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutCustomer,
    onSuccess: async () => {
      queryClient.clear();
      notifications.show({ color: 'green', title: 'Signed out', message: 'Your session has ended.' });
      window.location.replace(authRedirects.customerAfterLogout);
    },
    onError: (error) => fail(error, 'Could not sign out.')
  });
}
