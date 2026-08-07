import type {
  CustomerPaymentSummary,
  ManualPaymentMethodSummary,
  ReceiptUploadSummary
} from '@snacks/shared';

export type CustomerPaymentModel = CustomerPaymentSummary;
export type ManualPaymentMethodModel = ManualPaymentMethodSummary;
export type ReceiptUploadModel = ReceiptUploadSummary;

export interface CustomerPaymentVerificationInput {
  orderId: string;
  email: string;
  phone: string;
}

export interface SubmitManualProofInput extends CustomerPaymentVerificationInput {
  manualPaymentMethodId: string;
  receiptUrl: string;
  contentType: string;
  objectKey?: string;
  storageProvider?: string;
  note?: string;
}
