'use client';

import { useForm } from '@mantine/form';
import type { TenantNotificationChannel } from '@snacks/shared';
import {
  validateManualPaymentInstructions,
  validateManualPaymentKey,
  validateManualPaymentLabel,
  validateSettingsCurrency,
  validateSettingsEmail,
  validateSettingsName,
  validateSettingsTimezone
} from '@/validation/AdminSettings/adminSettingsValidation';

export function useAdminBusinessProfileForm() {
  return useForm({
    initialValues: {
      name: '',
      businessEmail: '',
      businessPhone: '',
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    validate: {
      name: validateSettingsName,
      businessEmail: validateSettingsEmail,
      defaultCurrency: validateSettingsCurrency,
      timezone: validateSettingsTimezone
    }
  });
}

export function useAdminApprovalSettingsForm() {
  return useForm({
    initialValues: {
      delegatedRoleApprovalRequired: true
    }
  });
}

export function useAdminNotificationSettingsForm() {
  return useForm({
    initialValues: {
      orderReadinessNotificationChannels: ['email'] as TenantNotificationChannel[]
    },
    validate: {
      orderReadinessNotificationChannels: (value) =>
        value.length > 0 ? null : 'Choose at least one channel.'
    }
  });
}

export function useAdminManualPaymentMethodForm() {
  return useForm({
    initialValues: {
      key: '',
      label: '',
      instructions: '',
      active: true
    },
    validate: {
      key: validateManualPaymentKey,
      label: validateManualPaymentLabel,
      instructions: validateManualPaymentInstructions
    }
  });
}
