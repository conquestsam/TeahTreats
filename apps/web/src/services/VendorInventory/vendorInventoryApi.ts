import { apiFetch } from '@/lib/api/client';
import type {
  VendorInventoryDetail,
  VendorInventoryRow
} from '@/types/VendorInventory/vendorInventoryTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listVendorInventory() {
  return apiFetch<ApiEnvelope<VendorInventoryRow[]>>('/vendor/inventory').then((response) => response.data);
}

export function getVendorInventoryBatch(batchId: string) {
  return apiFetch<ApiEnvelope<VendorInventoryDetail>>(`/vendor/inventory/${batchId}`).then(
    (response) => response.data,
  );
}
