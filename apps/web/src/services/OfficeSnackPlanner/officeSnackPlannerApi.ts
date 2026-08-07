import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type { OfficeSnackPlanInput, OfficeSnackPlanModel } from '@/types/OfficeSnackPlanner/officeSnackPlannerTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function createOfficeSnackPlan(input: OfficeSnackPlanInput) {
  return apiFetch<ApiEnvelope<OfficeSnackPlanModel>>('/shop/office-snack-plans', {
    method: 'POST',
    headers: { 'x-tenant-id': customerTenantId },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
