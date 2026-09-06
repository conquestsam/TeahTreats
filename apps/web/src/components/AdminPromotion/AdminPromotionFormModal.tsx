'use client';

import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import {
  promotionDiscountTypeOptions,
  promotionStatusOptions,
  promotionTargetTypeOptions
} from '@/constants/AdminPromotion/adminPromotionConstants';

interface PromotionFormValues {
  name: string;
  description: string;
  status: string;
  discountType: string;
  discountValue: number;
  targetType: string;
  targetProductIds: string;
  targetCategories: string;
  targetBrands: string;
  targetCustomerIds: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  perCustomerLimit: string;
  minimumOrderAmount: string;
  stackable: boolean;
  couponCode: string;
  couponUsageLimit: string;
}

interface AdminPromotionFormModalProps {
  mode: 'create' | 'edit';
  opened: boolean;
  loading?: boolean;
  form: UseFormReturnType<PromotionFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminPromotionFormModal({
  mode,
  opened,
  loading,
  form,
  onClose,
  onSubmit
}: AdminPromotionFormModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Create Promotion' : 'Edit Promotion'}
      size="xl"
      centered
      classNames={{ content: 'admin-mobile-modal-content', header: 'admin-mobile-modal-header', body: 'admin-mobile-modal-body' }}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="lg">
          <Stack gap="sm">
            <Text fw={850}>Step 1: Offer Details</Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Promotion name" placeholder="Weekend treat" {...form.getInputProps('name')} />
              <Select label="Status" data={promotionStatusOptions} {...form.getInputProps('status')} />
            </SimpleGrid>
            <Textarea label="Customer message" minRows={2} placeholder="A short note customers can understand." {...form.getInputProps('description')} />
          </Stack>

          <Stack gap="sm">
            <Text fw={850}>Step 2: Discount</Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <Select label="Discount type" data={promotionDiscountTypeOptions} {...form.getInputProps('discountType')} />
              <NumberInput label={form.values.discountType === 'percentage' || form.values.discountType === 'first_order' ? 'Discount percent' : 'Discount amount (USD)'} min={0} decimalScale={2} {...form.getInputProps('discountValue')} />
              <TextInput label="Coupon Code" placeholder="WELCOME10" {...form.getInputProps('couponCode')} />
            </SimpleGrid>
          </Stack>

          <Stack gap="sm">
            <Text fw={850}>Step 3: Rules</Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <Select label="Applies To" data={promotionTargetTypeOptions} {...form.getInputProps('targetType')} />
              <TextInput label="Start Date" placeholder="2026-08-05T09:00:00.000Z" {...form.getInputProps('startsAt')} />
              <TextInput label="End Date" placeholder="2026-08-31T23:59:00.000Z" {...form.getInputProps('endsAt')} />
              <TextInput label="Minimum order (USD)" placeholder="150.00" {...form.getInputProps('minimumOrderAmount')} />
              <TextInput label="Usage Limit" placeholder="100" {...form.getInputProps('usageLimit')} />
              <TextInput label="Per Customer Limit" placeholder="1" {...form.getInputProps('perCustomerLimit')} />
            </SimpleGrid>
            <TextInput label="Product IDs" placeholder="Optional, comma separated" {...form.getInputProps('targetProductIds')} />
            <TextInput label="Categories" placeholder="Pastries, drinks" {...form.getInputProps('targetCategories')} />
            <TextInput label="Brands" placeholder="Optional" {...form.getInputProps('targetBrands')} />
            <TextInput label="Customer IDs" placeholder="Optional, comma separated" {...form.getInputProps('targetCustomerIds')} />
            <Switch label="Allow with another discount" {...form.getInputProps('stackable', { type: 'checkbox' })} />
          </Stack>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={Boolean(loading)}>
              {mode === 'create' ? 'Create Promotion' : 'Save Promotion'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
