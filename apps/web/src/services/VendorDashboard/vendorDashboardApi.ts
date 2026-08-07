import { apiFetch } from '@/lib/api/client';
import type {
  VendorDashboardModel,
  VendorInventoryRow,
  VendorOrderRow,
  VendorProductRow
} from '@/types/VendorDashboard/vendorDashboardTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function getVendorDashboard() {
  return apiFetch<ApiEnvelope<VendorDashboardModel>>('/vendor/dashboard').then(
    (response) => response.data,
  );
}

export function listVendorProducts() {
  return apiFetch<ApiEnvelope<VendorProductRow[]>>('/vendor/products').then((response) => response.data);
}

export function listVendorInventory() {
  return apiFetch<ApiEnvelope<VendorInventoryRow[]>>('/vendor/inventory').then(
    (response) => response.data,
  );
}

export function listVendorOrders() {
  return apiFetch<ApiEnvelope<VendorOrderRow[]>>('/vendor/orders').then((response) => response.data);
}
