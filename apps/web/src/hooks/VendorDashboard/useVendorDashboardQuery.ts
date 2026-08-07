'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getVendorDashboard,
  listVendorInventory,
  listVendorOrders,
  listVendorProducts
} from '@/services/VendorDashboard/vendorDashboardApi';
import {
  vendorDashboardQueryKey,
  vendorInventoryQueryKey,
  vendorOrdersQueryKey,
  vendorProductsQueryKey
} from '@/constants/VendorDashboard/vendorDashboardConstants';

export function useVendorDashboardQuery() {
  return useQuery({ queryKey: vendorDashboardQueryKey, queryFn: getVendorDashboard });
}

export function useVendorProductsQuery() {
  return useQuery({ queryKey: vendorProductsQueryKey, queryFn: listVendorProducts });
}

export function useVendorInventoryQuery() {
  return useQuery({ queryKey: vendorInventoryQueryKey, queryFn: listVendorInventory });
}

export function useVendorOrdersQuery() {
  return useQuery({ queryKey: vendorOrdersQueryKey, queryFn: listVendorOrders });
}
