import type { TenantNotificationChannel, TenantSummary } from '@snacks/shared';

export interface AdminManualPaymentMethodModel {
  id: string;
  tenantId: string;
  key: string;
  label: string;
  instructions: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettingsModel {
  tenant: TenantSummary;
  manualPaymentMethods: AdminManualPaymentMethodModel[];
}

export interface AdminBusinessProfileInput {
  name: string;
  businessEmail?: string;
  businessPhone?: string;
  defaultCurrency: string;
  timezone: string;
  businessAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
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
