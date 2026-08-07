export const adminInventoryBatchQueryKey = ['admin-inventory', 'batches'] as const;
export const adminInventorySkuQueryKey = ['admin-inventory', 'sku-options'] as const;

export const createInventoryBatchInitialValues = {
  skuId: '',
  quantity: 0,
  expiresAt: '',
  reason: ''
};

export const adjustInventoryBatchInitialValues = {
  quantityDelta: 0,
  reason: ''
};
