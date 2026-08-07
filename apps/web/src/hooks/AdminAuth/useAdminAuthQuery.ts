'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAuthQueryKeys } from '@/constants/AdminAuth/adminAuthConstants';
import { getAdminCsrf, getCurrentAdminUser } from '@/services/AdminAuth/adminAuthApi';

export function useAdminCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: adminAuthQueryKeys.currentUser,
    queryFn: async () => {
      const response = await getCurrentAdminUser();
      return response.data;
    },
    retry: false,
    enabled
  });
}

export function useAdminCsrfQuery() {
  return useQuery({
    queryKey: ['admin-auth', 'csrf'],
    queryFn: getAdminCsrf,
    retry: false,
    staleTime: 25 * 60 * 1000
  });
}
