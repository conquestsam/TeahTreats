import { customerTenantId } from '@/constants/CustomerCart/customerCartConstants';
import { apiFetch } from '@/lib/api/client';
import type {
  ApiEnvelope,
  CapturePaypalOrderInput,
  CustomerPaymentSummary,
  CustomerPaymentVerificationInput,
  InitiatePaymentInput,
  ManualPaymentMethodSummary,
  PaymentGatewayStatusSummary,
  ReceiptUploadSummary,
  SubmitManualProofInput
} from '@snacks/shared';

const tenantHeaders = { 'x-tenant-id': customerTenantId };

export function listManualPaymentMethods() {
  return apiFetch<ApiEnvelope<ManualPaymentMethodSummary[]>>('/shop/payments/manual-methods', {
    headers: tenantHeaders
  }).then((response) => response.data);
}

export function initiatePayment(input: InitiatePaymentInput) {
  return apiFetch<ApiEnvelope<CustomerPaymentSummary>>('/shop/payments/initiate', {
    method: 'POST',
    headers: { ...tenantHeaders, 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function capturePaypalOrder(input: CapturePaypalOrderInput) {
  return apiFetch<ApiEnvelope<CustomerPaymentSummary>>('/shop/payments/paypal/capture', {
    method: 'POST',
    headers: { ...tenantHeaders, 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function getPaymentGatewayStatus() {
  return apiFetch<ApiEnvelope<PaymentGatewayStatusSummary>>('/shop/payments/gateway-status', {
    headers: tenantHeaders
  }).then((response) => response.data);
}


export function initiateManualPayment(input: CustomerPaymentVerificationInput) {
  return initiatePayment({ ...input, provider: 'manual' });
}

export function createReceiptUpload(input: CustomerPaymentVerificationInput & { contentType: string; sizeBytes?: number }) {
  return apiFetch<ApiEnvelope<ReceiptUploadSummary>>('/shop/payments/receipt-upload', {
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
  return apiFetch<ApiEnvelope<CustomerPaymentSummary>>('/shop/payments/status', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(input)
  }).then((response) => response.data);
}
