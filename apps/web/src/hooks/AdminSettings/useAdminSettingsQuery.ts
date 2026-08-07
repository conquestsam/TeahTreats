'use client';

import { useQuery } from '@tanstack/react-query';
import { adminSettingsQueryKey } from '@/constants/AdminSettings/adminSettingsConstants';
import { getAdminSettings } from '@/services/AdminSettings/adminSettingsApi';

export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: adminSettingsQueryKey,
    queryFn: getAdminSettings
  });
}
