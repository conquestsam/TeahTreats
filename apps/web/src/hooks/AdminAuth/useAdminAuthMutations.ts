'use client';

import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { queryClient } from '@/lib/query/query-client';
import { loginAdmin, logoutAdmin } from '@/services/AdminAuth/adminAuthApi';
import type { AdminLoginInput } from '@/types/AdminAuth/adminAuthTypes';
import { adminAuthQueryKeys } from '@/constants/AdminAuth/adminAuthConstants';
import { authRedirects } from '@/lib/auth/auth-routes';

export function useAdminLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: AdminLoginInput) => loginAdmin(input),
    onSuccess: async (response) => {
      queryClient.setQueryData(adminAuthQueryKeys.currentUser, response.data);
      notifications.show({
        color: 'green',
        title: 'Signed in',
        message: 'Welcome back.'
      });
      router.replace(authRedirects.adminAfterLogin);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Sign in failed',
        message: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  });
}

export function useAdminLogoutMutation() {
  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: async () => {
      queryClient.clear();
      notifications.show({
        color: 'green',
        title: 'Signed out',
        message: 'Your session has ended.'
      });
      window.location.replace(authRedirects.adminLogin);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Sign out failed',
        message: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  });
}
