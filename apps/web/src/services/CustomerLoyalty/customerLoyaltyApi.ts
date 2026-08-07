import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type { CustomerLoyaltyModel } from '@/types/CustomerLoyalty/customerLoyaltyTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

const tenantHeaders = { 'x-tenant-id': customerTenantId };

export function getCustomerLoyalty() {
  return apiFetch<ApiEnvelope<CustomerLoyaltyModel>>('/shop/loyalty', { headers: tenantHeaders }).then((response) => response.data);
}

export function claimCustomerQuest(questId: string) {
  return apiFetch<ApiEnvelope<CustomerLoyaltyModel>>(`/shop/loyalty/quests/${questId}/claim`, {
    method: 'POST',
    headers: tenantHeaders
  }).then((response) => response.data);
}
