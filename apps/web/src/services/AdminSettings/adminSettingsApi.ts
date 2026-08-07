import { apiFetch } from '@/lib/api/client';
import type {
  AdminApprovalSettingsInput,
  AdminBusinessProfileInput,
  AdminManualPaymentMethodInput,
  AdminManualPaymentMethodModel,
  AdminNotificationSettingsInput,
  AdminSettingsModel
} from '@/types/AdminSettings/adminSettingsTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function getAdminSettings() {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>('/admin/settings').then((response) => response.data);
}

export function updateAdminBusinessProfile(input: AdminBusinessProfileInput) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>('/admin/settings/business-profile', {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminApprovalSettings(input: AdminApprovalSettingsInput) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>('/admin/settings/approval', {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminNotificationSettings(input: AdminNotificationSettingsInput) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>('/admin/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function listAdminManualPaymentMethods() {
  return apiFetch<ApiEnvelope<AdminManualPaymentMethodModel[]>>('/admin/settings/manual-payment-methods').then(
    (response) => response.data,
  );
}

export function createAdminManualPaymentMethod(input: AdminManualPaymentMethodInput) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>('/admin/settings/manual-payment-methods', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminManualPaymentMethod(methodId: string, input: Partial<AdminManualPaymentMethodInput>) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>(`/admin/settings/manual-payment-methods/${methodId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function activateAdminManualPaymentMethod(methodId: string) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>(`/admin/settings/manual-payment-methods/${methodId}/activate`, {
    method: 'POST'
  }).then((response) => response.data);
}

export function deactivateAdminManualPaymentMethod(methodId: string) {
  return apiFetch<ApiEnvelope<AdminSettingsModel>>(`/admin/settings/manual-payment-methods/${methodId}/deactivate`, {
    method: 'POST'
  }).then((response) => response.data);
}
