export interface AdminMfaSetupModel {
  enabled: boolean;
  setupRequired: boolean;
  secretPreview: string;
  note: string;
}

export interface AdminAuditLogModel {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
