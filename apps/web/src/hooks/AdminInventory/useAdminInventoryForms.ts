'use client';

import { useForm } from '@mantine/form';
import {
  adjustInventoryBatchInitialValues,
  createInventoryBatchInitialValues
} from '@/constants/AdminInventory/adminInventoryConstants';
import {
  adjustInventoryBatchSchema,
  createInventoryBatchSchema,
  validateWithSchema,
  type AdjustInventoryBatchFormValues,
  type CreateInventoryBatchFormValues
} from '@/validation/AdminInventory/adminInventoryValidation';

export function useCreateInventoryBatchForm() {
  return useForm<CreateInventoryBatchFormValues>({
    initialValues: createInventoryBatchInitialValues,
    validate: (values) => validateWithSchema(createInventoryBatchSchema, values),
    validateInputOnBlur: true
  });
}

export function useAdjustInventoryBatchForm() {
  return useForm<AdjustInventoryBatchFormValues>({
    initialValues: adjustInventoryBatchInitialValues,
    validate: (values) => validateWithSchema(adjustInventoryBatchSchema, values),
    validateInputOnBlur: true
  });
}
