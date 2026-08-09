import { apiFetch } from '@/lib/api/client';
import type {
  AdminReportDateRangeInput,
  AdminReportsDashboardModel
} from '@/types/AdminReport/adminReportTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function getAdminReportsDashboard(range: AdminReportDateRangeInput) {
  const params = new URLSearchParams();
  if (range.from) {
    params.set('from', new Date(range.from).toISOString());
  }
  if (range.to) {
    params.set('to', new Date(`${range.to}T23:59:59.999`).toISOString());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<ApiEnvelope<AdminReportsDashboardModel>>(`/admin/reports/dashboard${query}`, {
    headers: { 'x-tenant-id': 'all' }
  }).then(
    (response) => response.data,
  );
}
