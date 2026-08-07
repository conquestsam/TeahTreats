import { apiFetch } from '@/lib/api/client';
import type { AdminPromotionInput, AdminPromotionModel } from '@/types/AdminPromotion/adminPromotionTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listAdminPromotions() {
  return apiFetch<ApiEnvelope<AdminPromotionModel[]>>('/admin/promotions').then((response) => response.data);
}

export function createAdminPromotion(input: AdminPromotionInput) {
  return apiFetch<ApiEnvelope<AdminPromotionModel>>('/admin/promotions', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminPromotion(promotionId: string, input: Partial<AdminPromotionInput>) {
  return apiFetch<ApiEnvelope<AdminPromotionModel>>(`/admin/promotions/${promotionId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function archiveAdminPromotion(promotionId: string) {
  return apiFetch<ApiEnvelope<AdminPromotionModel>>(`/admin/promotions/${promotionId}/archive`, {
    method: 'POST'
  }).then((response) => response.data);
}
