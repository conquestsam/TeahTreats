export type CustomerPaymentProvider = 'manual' | 'stripe' | 'paypal';

export interface ManualPaymentMethodSummary {
  id: string;
  key: string;
  label: string;
  instructions: string;
}

export interface CustomerPaymentSummary {
  id: string;
  orderId: string;
  provider: CustomerPaymentProvider | null;
  status: string;
  amountCents: number;
  currency: string;
  providerRef: string | null;
  metadata?: Record<string, unknown>;
  orderStatus?: string;
  reconciliationStatus?: string;
  reconciledAt?: string | null;
  lastProviderEventId?: string | null;
}

export interface ReceiptUploadSummary {
  provider: 'cloudinary' | 'r2';
  uploadUrl: string;
  fields: Record<string, string | number>;
  objectKey: string;
  publicUrl: string;
  expiresInSeconds: number;
}

export interface ManualPaymentProofSummary {
  id: string;
  paymentId: string;
  orderId: string;
  shortOrderRef: string;
  receiptReference: string;
  methodLabel: string;
  methodInstructions: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerSummary: string;
  amountCents: number;
  currency: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  orderStatus: string;
  orderStatusLabel: string;
  reconciliationStatus: string;
  reconciliationStatusLabel: string;
  reviewStatusLabel: string;
  reconciledAt: string | null;
  lastProviderEventId: string | null;
  receiptUrl: string | null;
  note: string | null;
  orderSubtotalCents: number;
  orderDiscountCents: number;
  orderTotalCents: number;
  orderCreatedAt: string;
  reservationExpiresAt: string | null;
  items: ManualPaymentProofOrderItemSummary[];
  createdAt: string;
}

export interface ManualPaymentProofOrderItemSummary {
  productName: string;
  skuName: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CustomerPaymentVerificationInput {
  orderId: string;
  email: string;
  phone: string;
}

export interface InitiatePaymentInput extends CustomerPaymentVerificationInput {
  provider: CustomerPaymentProvider;
}

export interface CreateReceiptUploadInput extends CustomerPaymentVerificationInput {
  contentType: string;
  sizeBytes?: number;
}

export interface SubmitManualProofInput extends CustomerPaymentVerificationInput {
  manualPaymentMethodId: string;
  receiptUrl?: string;
  contentType?: string;
  sizeBytes?: number;
  objectKey?: string;
  storageProvider?: string;
  note?: string;
}

export interface CapturePaypalOrderInput extends CustomerPaymentVerificationInput {
  paypalOrderId: string;
}

export interface PaymentGatewayAvailability {
  isAvailable: boolean;
  reason?: string | null;
  publishableKey?: string | null;
  clientId?: string | null;
}

export interface PaymentGatewayStatusSummary {
  stripe: PaymentGatewayAvailability;
  paypal: PaymentGatewayAvailability;
  manual: PaymentGatewayAvailability;
}

export interface SubmitManualProofSummary {
  id: string;
  status: string;
  receiptAttached?: boolean;
}
