'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAuditLogQueryKey } from '@/constants/AdminSecurity/adminSecurityConstants';
import { listAdminAuditLogs } from '@/services/AdminSecurity/adminSecurityApi';

export function useAdminAuditLogQuery(kind: string) {
  return useQuery({
    queryKey: [...adminAuditLogQueryKey, kind],
    queryFn: () => listAdminAuditLogs(kind)
  });
}
