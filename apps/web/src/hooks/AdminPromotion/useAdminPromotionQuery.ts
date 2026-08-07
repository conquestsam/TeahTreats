'use client';

import { useQuery } from '@tanstack/react-query';
import { adminPromotionQueryKey } from '@/constants/AdminPromotion/adminPromotionConstants';
import { listAdminPromotions } from '@/services/AdminPromotion/adminPromotionApi';

export function useAdminPromotionQuery() {
  return useQuery({
    queryKey: adminPromotionQueryKey,
    queryFn: listAdminPromotions
  });
}
