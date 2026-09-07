import type { CheckoutStartedSummary, CouponValidationSummary, CustomerCartSummary } from '@snacks/shared';
export type {
  CheckoutCustomerInput,
  CustomerFulfillmentMethod,
  DeliverySlot,
  ValidateCouponInput
} from '@snacks/shared';

export type CustomerCartModel = CustomerCartSummary;
export type CheckoutStartedModel = CheckoutStartedSummary;
export type CustomerCouponPreviewModel = CouponValidationSummary;
