'use client';

import {
  Button,
  Group,
  Modal,
  MultiSelect,
  SimpleGrid,
  Stack,
  Switch,
  TextInput
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { tenantNotificationChannelOptions } from '@/constants/AdminTenant/adminTenantConstants';

interface AdminTenantFormValues {
  name: string;
  slug: string;
  businessEmail: string;
  businessPhone: string;
  delegatedRoleApprovalRequired: boolean;
  manualPaymentEnabled: boolean;
  defaultCurrency: string;
  timezone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  orderReadinessNotificationChannels: Array<'email' | 'sms' | 'whatsapp'>;
}

interface AdminTenantFormModalProps {
  mode: 'create' | 'edit';
  opened: boolean;
  loading?: boolean;
  form: UseFormReturnType<AdminTenantFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminTenantFormModal({
  mode,
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminTenantFormModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Create Tenant' : 'Edit Tenant'}
      size="lg"
      centered
    >
      <form
        onSubmit={form.onSubmit(() => {
          onSubmit();
        })}
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Name" placeholder="Downtown Snacks" {...form.getInputProps('name')} />
            <TextInput label="Slug" placeholder="downtown-snacks" {...form.getInputProps('slug')} />
            <TextInput label="Business Email" placeholder="ops@example.com" {...form.getInputProps('businessEmail')} />
            <TextInput label="Business Phone" placeholder="+15551234567" {...form.getInputProps('businessPhone')} />
            <TextInput label="Currency" placeholder="USD" {...form.getInputProps('defaultCurrency')} />
            <TextInput label="Timezone" placeholder="America/New_York" {...form.getInputProps('timezone')} />
          </SimpleGrid>

          <TextInput label="Address" placeholder="100 Market Street" {...form.getInputProps('addressLine1')} />
          <TextInput label="Address Line 2" placeholder="Suite 20" {...form.getInputProps('addressLine2')} />
          <SimpleGrid cols={{ base: 1, sm: 4 }}>
            <TextInput label="City" {...form.getInputProps('city')} />
            <TextInput label="State" {...form.getInputProps('state')} />
            <TextInput label="Postal Code" {...form.getInputProps('postalCode')} />
            <TextInput label="Country" {...form.getInputProps('country')} />
          </SimpleGrid>

          <MultiSelect
            label="Ready Notification"
            data={tenantNotificationChannelOptions}
            {...form.getInputProps('orderReadinessNotificationChannels')}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Switch
              label="Role changes need approval"
              {...form.getInputProps('delegatedRoleApprovalRequired', { type: 'checkbox' })}
            />
            <Switch
              label="Manual payment enabled"
              {...form.getInputProps('manualPaymentEnabled', { type: 'checkbox' })}
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={Boolean(loading)}>
              {mode === 'create' ? 'Create Tenant' : 'Save Tenant'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
