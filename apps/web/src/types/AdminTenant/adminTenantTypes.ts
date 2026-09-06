import type { TenantBusinessAddress, TenantNotificationChannel, TenantSummary } from '@snacks/shared';
export type {
  AdminTenantInput,
  DeactivateTenantInput,
  ReactivateTenantInput
} from '@snacks/shared';

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
