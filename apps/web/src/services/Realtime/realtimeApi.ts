import { apiFetch, temporaryTenantId } from '@/lib/api/client';
import { connectSse } from '@/lib/realtime/sse-client';
import type { RealtimeEnvelope } from '@/types/Realtime/realtimeTypes';

export function connectAdminRealtime(onEvent: (event: RealtimeEnvelope) => void) {
  return connectSse('/realtime/admin', (event) => {
    onEvent(JSON.parse(event.data) as RealtimeEnvelope);
  });
}

export function verifyCustomerOrderStream(input: { orderId: string; email: string; phone: string }) {
  const params = new URLSearchParams({
    ...input,
    ...(temporaryTenantId ? { tenantId: temporaryTenantId } : {})
  });
  return apiFetch<{ data: { ok: boolean } }>(`/realtime/customer-order/verify?${params.toString()}`);
}

export function connectCustomerOrderRealtime(
  input: { orderId: string; email: string; phone: string },
  onEvent: (event: RealtimeEnvelope) => void,
) {
  const params = new URLSearchParams({
    ...input,
    ...(temporaryTenantId ? { tenantId: temporaryTenantId } : {})
  });
  return connectSse(`/realtime/customer-order?${params.toString()}`, (event) => {
    onEvent(JSON.parse(event.data) as RealtimeEnvelope);
  });
}
