import type { CheckoutCustomerFormValues } from '@/validation/CustomerCart/customerCartValidation';

export const customerCartQueryKey = ['customer-cart'] as const;

export const checkoutCustomerInitialValues: CheckoutCustomerFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  fulfillmentMethod: 'delivery_handoff',
  recipientName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  handoffInstructions: '',
  deliveryDate: '',
  deliveryWindow: ''
};

export const customerTenantId = process.env.NEXT_PUBLIC_TEMP_TENANT_ID ?? 'platform';
