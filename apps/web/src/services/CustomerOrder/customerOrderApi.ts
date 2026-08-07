import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type { CustomerOrderDetail, CustomerOrderListItem } from '@/types/CustomerOrder/customerOrderTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

const tenantHeaders = { 'x-tenant-id': customerTenantId };

export function listCustomerOrders() {
  return apiFetch<ApiEnvelope<CustomerOrderListItem[]>>('/shop/orders', {
    headers: tenantHeaders,
    skipAuthRefresh: true
  }).then((response) => response.data);
}

export function getCustomerOrder(orderId: string) {
  return apiFetch<ApiEnvelope<CustomerOrderDetail>>(`/shop/orders/${orderId}`, {
    headers: tenantHeaders,
    skipAuthRefresh: true
  }).then((response) => response.data);
}

export function completeCustomerOrder(orderId: string) {
  return apiFetch<ApiEnvelope<CustomerOrderDetail>>(`/shop/orders/${orderId}/complete`, {
    method: 'POST',
    headers: tenantHeaders,
    skipAuthRefresh: true
  }).then((response) => response.data);
}
