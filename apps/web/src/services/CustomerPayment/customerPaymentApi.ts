import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type {
  CapturePaypalOrderInput,
  CustomerPaymentModel,
  CustomerPaymentVerificationInput,
  ManualPaymentMethodModel,
  ReceiptUploadModel,
  SubmitManualProofInput
} from '@/types/CustomerPayment/customerPaymentTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

interface PaymentGatewayAvailability {
  isAvailable: boolean;
  reason?: string | null;
  publishableKey?: string | null;
  clientId?: string | null;
}

const tenantHeaders = { 'x-tenant-id': customerTenantId };

export function listManualPaymentMethods() {
  return apiFetch<ApiEnvelope<ManualPaymentMethodModel[]>>('/shop/payments/manual-methods', {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function initiatePayment(input: CustomerPaymentVerificationInput & { provider: 'stripe' | 'paypal' | 'manual' }) {
  return apiFetch<ApiEnvelope<CustomerPaymentModel>>('/shop/payments/initiate', {
    method: 'POST',
    headers: { ...tenantHeaders, 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function capturePaypalOrder(input: CapturePaypalOrderInput) {
  return apiFetch<ApiEnvelope<CustomerPaymentModel>>('/shop/payments/paypal/capture', {
    method: 'POST',
    headers: { ...tenantHeaders, 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function getPaymentGatewayStatus() {
  return apiFetch<ApiEnvelope<{
    stripe: PaymentGatewayAvailability;
    paypal: PaymentGatewayAvailability;
    manual: PaymentGatewayAvailability;
  }>>('/shop/payments/gateway-status', {
    headers: tenantHeaders
  }).then((response) => response.data);
}


export function initiateManualPayment(input: CustomerPaymentVerificationInput) {
  return initiatePayment({ ...input, provider: 'manual' });
}

export function createReceiptUpload(input: CustomerPaymentVerificationInput & { contentType: string; sizeBytes?: number }) {
  return apiFetch<ApiEnvelope<ReceiptUploadModel>>('/shop/payments/receipt-upload', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function submitManualPaymentProof(input: SubmitManualProofInput) {
  return apiFetch<ApiEnvelope<{ id: string; status: string }>>('/shop/payments/manual-proof', {
    method: 'POST',
    headers: { ...tenantHeaders, 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function getCustomerPaymentStatus(input: CustomerPaymentVerificationInput) {
  return apiFetch<ApiEnvelope<CustomerPaymentModel>>('/shop/payments/status', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
