export const customerCartQueryKey = ['customer-cart'] as const;

export const checkoutCustomerInitialValues = {
  name: '',
  email: '',
  phone: '',
  address: ''
};

export const customerTenantId = process.env.NEXT_PUBLIC_TEMP_TENANT_ID ?? 'platform';
