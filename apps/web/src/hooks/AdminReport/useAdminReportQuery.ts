'use client';

import { useQuery } from '@tanstack/react-query';
import { adminReportsQueryKey } from '@/constants/AdminReport/adminReportConstants';
import { getAdminReportsDashboard } from '@/services/AdminReport/adminReportApi';
import type { AdminReportDateRangeInput } from '@/types/AdminReport/adminReportTypes';

export function useAdminReportDashboardQuery(range: AdminReportDateRangeInput) {
  return useQuery({
    queryKey: [...adminReportsQueryKey, range.from, range.to],
    queryFn: () => getAdminReportsDashboard(range)
  });
}
