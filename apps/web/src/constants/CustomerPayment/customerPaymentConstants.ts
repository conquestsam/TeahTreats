export const customerPaymentMethodQueryKey = ['customer-payment', 'manual-methods'] as const;
export const customerPaymentStatusQueryKey = ['customer-payment', 'status'] as const;

export const customerPaymentInitialValues = {
  orderId: '',
  email: '',
  phone: '',
  manualPaymentMethodId: '',
  receiptUrl: '',
  contentType: 'image/jpeg' as const,
  objectKey: '',
  storageProvider: '',
  note: ''
};

export const customerPaymentContentTypes = [
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'application/pdf', label: 'PDF' }
] as const;
