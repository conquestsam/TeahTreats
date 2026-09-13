'use client';

import { useForm } from '@mantine/form';
import {
  adjustInventoryBatchInitialValues,
  createInventoryBatchInitialValues,
  updateInventoryBatchExpiryInitialValues
} from '@/constants/AdminInventory/adminInventoryConstants';
import {
  adjustInventoryBatchSchema,
  createInventoryBatchSchema,
  updateInventoryBatchExpirySchema,
  validateWithSchema,
  type AdjustInventoryBatchFormValues,
  type CreateInventoryBatchFormValues,
  type UpdateInventoryBatchExpiryFormValues
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

export function useUpdateInventoryBatchExpiryForm() {
  return useForm<UpdateInventoryBatchExpiryFormValues>({
    initialValues: updateInventoryBatchExpiryInitialValues,
    validate: (values) => validateWithSchema(updateInventoryBatchExpirySchema, values),
    validateInputOnBlur: true
  });
}
