import type { TenantBusinessAddress, TenantNotificationChannel, TenantSummary } from '@snacks/shared';

export type AdminTenantModel = TenantSummary;

export const defaultTenantReadinessChannels: TenantNotificationChannel[] = ['email'];

export function getTenantReadinessChannels(tenant: Partial<AdminTenantModel>): TenantNotificationChannel[] {
  const channels = tenant.settings?.orderReadinessNotificationChannels;
  return Array.isArray(channels) && channels.length > 0 ? channels : defaultTenantReadinessChannels;
}

export function getTenantBusinessAddress(tenant: Partial<AdminTenantModel>): TenantBusinessAddress {
  return tenant.settings?.businessAddress ?? {};
}

export function tenantReadinessChannelsLabel(tenant: Partial<AdminTenantModel>) {
  return getTenantReadinessChannels(tenant).join(', ');
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
  businessAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  orderReadinessNotificationChannels?: Array<'email' | 'sms' | 'whatsapp'>;
}

export interface DeactivateTenantInput {
  reason: string;
  force?: boolean;
}

export interface ReactivateTenantInput {
  reason?: string;
}
