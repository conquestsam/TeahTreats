import { apiFetch } from '@/lib/api/client';
import type { VendorOrderDetail, VendorOrderRow } from '@/types/VendorOrder/vendorOrderTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listVendorOrders() {
  return apiFetch<ApiEnvelope<VendorOrderRow[]>>('/vendor/orders').then((response) => response.data);
}

export function getVendorOrder(orderId: string) {
  return apiFetch<ApiEnvelope<VendorOrderDetail>>(`/vendor/orders/${orderId}`).then(
    (response) => response.data,
  );
}
