'use client';

import { useQuery } from '@tanstack/react-query';
import { adminTenantQueryKey } from '@/constants/AdminTenant/adminTenantConstants';
import { listAdminTenants } from '@/services/AdminTenant/adminTenantApi';

export function useAdminTenantQuery() {
  return useQuery({ queryKey: adminTenantQueryKey, queryFn: listAdminTenants });
}
