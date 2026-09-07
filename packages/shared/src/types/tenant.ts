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

export interface AdminManualPaymentMethodSummary {
  id: string;
  tenantId: string;
  key: string;
  label: string;
  instructions: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettingsSummary {
  tenant: TenantSummary;
  manualPaymentMethods: AdminManualPaymentMethodSummary[];
  deliverySlots: AdminDeliverySlotSummary[];
}

export interface AdminBusinessProfileInput {
  name: string;
  businessEmail?: string;
  businessPhone?: string;
  defaultCurrency: string;
  timezone: string;
  businessAddress?: TenantBusinessAddress;
}

export interface AdminApprovalSettingsInput {
  delegatedRoleApprovalRequired: boolean;
}

export interface AdminNotificationSettingsInput {
  orderReadinessNotificationChannels: TenantNotificationChannel[];
}

export interface AdminManualPaymentMethodInput {
  key: string;
  label: string;
  instructions: string;
  active?: boolean;
}

export interface AdminDeliverySlotSummary {
  id: string;
  tenantId: string;
  label: string;
  method: 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';
  startTime: string;
  endTime: string;
  feeCents: number;
  capacity: number;
  cutoffTime: string;
  active: boolean;
  hubId: string | null;
  storeId: string | null;
  bookedCount: number;
  remainingCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDeliverySlotInput {
  label: string;
  method: 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';
  startTime: string;
  endTime: string;
  feeCents: number;
  capacity: number;
  cutoffTime: string;
  active?: boolean;
  hubId?: string;
  storeId?: string;
}

export interface AdminTenantInput {
  name: string;
  slug: string;
  businessEmail?: string;
  businessPhone?: string;
  delegatedRoleApprovalRequired?: boolean;
  manualPaymentEnabled?: boolean;
  defaultCurrency?: string;
  timezone?: string;
  businessAddress?: TenantBusinessAddress;
  orderReadinessNotificationChannels?: TenantNotificationChannel[];
}

export interface DeactivateTenantInput {
  reason: string;
  force?: boolean;
}

export interface ReactivateTenantInput {
  reason?: string;
}
