export interface AdminMfaSetupSummary {
  enabled: boolean;
  setupRequired: boolean;
  secretPreview: string;
  note: string;
}

export interface AdminMfaVerifySummary {
  enabled: boolean;
  verifiedAt: string | null;
}

export interface AdminMfaDisableSummary {
  enabled: boolean;
}

export interface AdminAuditLogSummary {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
