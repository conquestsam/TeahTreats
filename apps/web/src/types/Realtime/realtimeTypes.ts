export interface RealtimeEnvelope {
  topic: string;
  type: string;
  tenantId: string | null;
  orderId?: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}
