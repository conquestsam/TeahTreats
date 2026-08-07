'use client';

import { Button, Group, Modal, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { motion } from 'motion/react';
import {
  customerPaymentContentTypes
} from '@/constants/CustomerPayment/customerPaymentConstants';
import type { useCustomerPaymentForm } from '@/hooks/CustomerPayment/useCustomerPaymentForm';
import type { ManualPaymentMethodModel } from '@/types/CustomerPayment/customerPaymentTypes';

interface CustomerManualProofModalProps {
  opened: boolean;
  loading: boolean;
  methods: ManualPaymentMethodModel[];
  form: ReturnType<typeof useCustomerPaymentForm>;
  onCreateUpload: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function CustomerManualProofModal({
  opened,
  loading,
  methods,
  form,
  onCreateUpload,
  onClose,
  onSubmit
}: CustomerManualProofModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Upload Receipt" centered>
      <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput label="Order ID" withAsterisk {...form.getInputProps('orderId')} />
          <TextInput label="Email" withAsterisk {...form.getInputProps('email')} />
          <TextInput label="Phone" withAsterisk {...form.getInputProps('phone')} />
          <Select
            label="Payment Method"
            data={methods.map((method) => ({ value: method.id, label: method.label }))}
            withAsterisk
            {...form.getInputProps('manualPaymentMethodId')}
          />
          <Select label="Receipt Type" data={customerPaymentContentTypes} {...form.getInputProps('contentType')} />
          <TextInput label="Receipt URL" withAsterisk {...form.getInputProps('receiptUrl')} />
          <Textarea label="Note" {...form.getInputProps('note')} />
          <Group justify="space-between">
            <Button variant="light" onClick={onCreateUpload}>
              Create Upload Link
            </Button>
            <Group>
              <Button variant="light" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Submit
              </Button>
            </Group>
          </Group>
        </Stack>
      </motion.form>
    </Modal>
  );
}
