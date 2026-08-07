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
  methodLabel: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  reconciliationStatus: string;
  reconciledAt: string | null;
  lastProviderEventId: string | null;
  receiptUrl: string;
  note: string | null;
  createdAt: string;
}
