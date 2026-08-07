'use client';

import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerCartQueryKey } from '@/constants/CustomerCart/customerCartConstants';
import { customerAuthQueryKey } from '@/constants/CustomerAuth/customerAuthConstants';
import { loginCustomer, logoutCustomer, signupCustomer } from '@/services/CustomerAuth/customerAuthApi';
import type { CustomerLoginInput, CustomerSignupInput } from '@/types/CustomerAuth/customerAuthTypes';

function fail(error: unknown, fallback: string) {
  notifications.show({
    color: 'red',
    title: 'Action failed',
    message: error instanceof Error ? error.message : fallback
  });
}

export function useCustomerLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerLoginInput) => loginCustomer(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerAuthQueryKey }),
        queryClient.invalidateQueries({ queryKey: customerCartQueryKey })
      ]);
      notifications.show({ color: 'green', title: 'Signed in', message: 'Welcome back.' });
      window.location.replace('/account');
    },
    onError: (error) => fail(error, 'Could not sign in.')
  });
}

export function useCustomerSignupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerSignupInput) => signupCustomer(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerAuthQueryKey }),
        queryClient.invalidateQueries({ queryKey: customerCartQueryKey })
      ]);
      notifications.show({ color: 'green', title: 'Account created', message: 'You are signed in.' });
      window.location.replace('/account');
    },
    onError: (error) => fail(error, 'Could not create account.')
  });
}

export function useCustomerLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerAuthQueryKey });
      notifications.show({ color: 'green', title: 'Signed out', message: 'Your session has ended.' });
      window.location.replace('/');
    },
    onError: (error) => fail(error, 'Could not sign out.')
  });
}
