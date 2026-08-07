import type { CheckoutStartedSummary, CouponValidationSummary, CustomerCartSummary } from '@snacks/shared';

export type CustomerCartModel = CustomerCartSummary;
export type CheckoutStartedModel = CheckoutStartedSummary;
export type CustomerCouponPreviewModel = CouponValidationSummary;

export interface CheckoutCustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  couponCode?: string;
}
