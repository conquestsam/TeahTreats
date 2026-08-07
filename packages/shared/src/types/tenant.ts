export const tenantNotificationChannels = ['email', 'sms', 'whatsapp'] as const;

export type TenantNotificationChannel = (typeof tenantNotificationChannels)[number];

export interface TenantBusinessAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface TenantSettings {
  businessAddress?: TenantBusinessAddress;
  orderReadinessNotificationChannels: TenantNotificationChannel[];
}

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  businessEmail: string | null;
  businessPhone: string | null;
  active: boolean;
  delegatedRoleApprovalRequired: boolean;
  manualPaymentEnabled: boolean;
  defaultCurrency: string;
  timezone: string;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
}

export interface VendorDashboardSummary {
  tenant: TenantSummary;
  metrics: {
    productCount: number;
    activeProductCount: number;
    draftProductCount: number;
    archivedProductCount: number;
    inventoryAvailableCount: number;
    lowStockCount: number;
    expiredBatchCount: number;
    openOrderCount: number;
    pendingManualPaymentCount: number;
  };
}
