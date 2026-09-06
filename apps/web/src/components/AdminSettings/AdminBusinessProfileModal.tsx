'use client';

import { Button, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface BusinessProfileValues {
  name: string;
  businessEmail: string;
  businessPhone: string;
  defaultCurrency: string;
  timezone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AdminBusinessProfileModalProps {
  opened: boolean;
  loading?: boolean;
  form: UseFormReturnType<BusinessProfileValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminBusinessProfileModal({
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminBusinessProfileModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Business Profile" size="lg" centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Name" placeholder="Downtown Snacks" {...form.getInputProps('name')} />
            <TextInput label="Email" placeholder="ops@example.com" {...form.getInputProps('businessEmail')} />
            <TextInput label="Phone" placeholder="+15551234567" {...form.getInputProps('businessPhone')} />
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

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={Boolean(loading)}>
              Save Profile
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
