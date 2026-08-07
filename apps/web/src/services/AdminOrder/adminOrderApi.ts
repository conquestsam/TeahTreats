import { apiFetch } from '@/lib/api/client';
import type { AdminOrderDetail, AdminOrderListItem } from '@/types/AdminOrder/adminOrderTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listAdminOrders() {
  return apiFetch<ApiEnvelope<AdminOrderListItem[]>>('/admin/orders').then((response) => response.data);
}

export function getAdminOrder(orderId: string) {
  return apiFetch<ApiEnvelope<AdminOrderDetail>>(`/admin/orders/${orderId}`).then((response) => response.data);
}

export function prepareAdminOrder(orderId: string) {
  return apiFetch<ApiEnvelope<AdminOrderDetail>>(`/admin/orders/${orderId}/prepare`, { method: 'POST' }).then(
    (response) => response.data,
  );
}

export function readyAdminOrder(orderId: string) {
  return apiFetch<ApiEnvelope<AdminOrderDetail>>(`/admin/orders/${orderId}/ready`, { method: 'POST' }).then(
    (response) => response.data,
  );
}

export function completeAdminOrder(orderId: string) {
  return apiFetch<ApiEnvelope<AdminOrderDetail>>(`/admin/orders/${orderId}/complete`, { method: 'POST' }).then(
    (response) => response.data,
  );
}

export function cancelAdminOrder(orderId: string, reason: string) {
  return apiFetch<ApiEnvelope<AdminOrderDetail>>(`/admin/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }).then((response) => response.data);
}
