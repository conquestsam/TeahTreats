'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getVendorInventoryBatch,
  listVendorInventory
} from '@/services/VendorInventory/vendorInventoryApi';

export const vendorInventoryQueryKey = ['vendor-inventory'] as const;

export function useVendorInventoryQuery() {
  return useQuery({ queryKey: vendorInventoryQueryKey, queryFn: listVendorInventory });
}

export function useVendorInventoryDetailQuery(batchId: string | null) {
  return useQuery({
    queryKey: ['vendor-inventory-detail', batchId],
    queryFn: () => getVendorInventoryBatch(batchId as string),
    enabled: Boolean(batchId)
  });
}
