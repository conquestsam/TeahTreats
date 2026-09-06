import type {
  CustomerPaymentSummary,
  ManualPaymentMethodSummary,
  ReceiptUploadSummary
} from '@snacks/shared';
export type {
  CapturePaypalOrderInput,
  CreateReceiptUploadInput,
  CustomerPaymentVerificationInput,
  InitiatePaymentInput,
  PaymentGatewayAvailability,
  PaymentGatewayStatusSummary,
  SubmitManualProofInput,
  SubmitManualProofSummary
} from '@snacks/shared';

export type CustomerPaymentModel = CustomerPaymentSummary;
export type ManualPaymentMethodModel = ManualPaymentMethodSummary;
export type ReceiptUploadModel = ReceiptUploadSummary;
