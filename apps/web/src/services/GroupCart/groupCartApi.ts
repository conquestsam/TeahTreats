import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type { AddGroupCartItemInput, CreateGroupCartInput, GroupCartModel } from '@/types/GroupCart/groupCartTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

const tenantHeaders = { 'x-tenant-id': customerTenantId };

export function listGroupCarts() {
  return apiFetch<ApiEnvelope<GroupCartModel[]>>('/shop/group-carts', { headers: tenantHeaders }).then((response) => response.data);
}

export function createGroupCart(input: CreateGroupCartInput) {
  return apiFetch<ApiEnvelope<GroupCartModel>>('/shop/group-carts', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function addGroupCartItem(groupCartId: string, input: AddGroupCartItemInput) {
  return apiFetch<ApiEnvelope<GroupCartModel>>(`/shop/group-carts/${groupCartId}/items`, {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function mergeGroupCart(groupCartId: string) {
  return apiFetch<ApiEnvelope<GroupCartModel>>(`/shop/group-carts/${groupCartId}/merge`, {
    method: 'POST',
    headers: tenantHeaders
  }).then((response) => response.data);
}
