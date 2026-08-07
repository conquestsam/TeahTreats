import { useForm } from '@mantine/form';
import {
  validateDeactivateReason,
  validateTenantCurrency,
  validateTenantEmail,
  validateTenantName,
  validateTenantSlug
} from '@/validation/AdminTenant/adminTenantValidation';

export function useAdminTenantForm() {
  return useForm({
    initialValues: {
      name: '',
      slug: '',
      businessEmail: '',
      businessPhone: '',
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      orderReadinessNotificationChannels: ['email'] as Array<'email' | 'sms' | 'whatsapp'>
    },
    validate: {
      name: validateTenantName,
      slug: validateTenantSlug,
      businessEmail: validateTenantEmail,
      defaultCurrency: validateTenantCurrency,
      timezone: (value) => (value.trim().length < 2 ? 'Timezone is required.' : null)
    }
  });
}

export function useDeactivateTenantForm() {
  return useForm({
    initialValues: {
      reason: '',
      force: false
    },
    validate: {
      reason: validateDeactivateReason
    }
  });
}
