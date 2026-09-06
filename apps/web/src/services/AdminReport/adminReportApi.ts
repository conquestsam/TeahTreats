import { apiFetch } from '@/lib/api/client';
import type {
  ApiEnvelope,
  AdminReportDateRangeInput,
  AdminReportsDashboardSummary
} from '@snacks/shared';

export function getAdminReportsDashboard(range: AdminReportDateRangeInput, tenantScope?: string) {
  const params = new URLSearchParams();
  if (range.from) {
    params.set('from', new Date(range.from).toISOString());
  }
  if (range.to) {
    params.set('to', new Date(`${range.to}T23:59:59.999`).toISOString());
  }
  const query = params.toString() ? `?${params.toString()}` : '';

  const init = tenantScope ? { headers: { 'x-tenant-id': tenantScope } } : undefined;

  return apiFetch<ApiEnvelope<AdminReportsDashboardSummary>>(`/admin/reports/dashboard${query}`, init).then(
    (response) => response.data,
  );
}
