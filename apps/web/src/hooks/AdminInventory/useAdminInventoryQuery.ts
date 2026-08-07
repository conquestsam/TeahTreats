'use client';

import { useQuery } from '@tanstack/react-query';
import {
  adminInventoryBatchQueryKey,
  adminInventorySkuQueryKey
} from '@/constants/AdminInventory/adminInventoryConstants';
import {
  listInventoryBatches,
  listInventorySkuOptions
} from '@/services/AdminInventory/adminInventoryApi';

export function useAdminInventoryBatchQuery() {
  return useQuery({ queryKey: adminInventoryBatchQueryKey, queryFn: listInventoryBatches });
}

export function useAdminInventorySkuQuery() {
  return useQuery({ queryKey: adminInventorySkuQueryKey, queryFn: listInventorySkuOptions });
}
