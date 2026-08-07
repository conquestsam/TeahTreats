import type { VendorDashboardSummary } from '@snacks/shared';

export type VendorDashboardModel = VendorDashboardSummary;

export interface VendorProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  skuCount: number;
  activeSkuCount: number;
  updatedAt: string;
}

export interface VendorInventoryRow {
  id: string;
  productName: string;
  skuName: string;
  quantity: number;
  reserved: number;
  available: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  expiresAt: string | null;
  expiredAt: string | null;
  updatedAt: string;
}

export interface VendorOrderRow {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  itemCount: number;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  reservationExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
