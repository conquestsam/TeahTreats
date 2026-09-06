export interface RealtimeEnvelope {
  topic: string;
  type: string;
  tenantId: string | null;
  orderId?: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface CustomerOrderStreamVerificationInput {
  orderId: string;
  email: string;
  phone: string;
}

export interface CustomerOrderStreamVerificationSummary {
  ok: boolean;
}
