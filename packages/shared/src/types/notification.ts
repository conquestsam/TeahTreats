export type NotificationDeliveryStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'skipped';
export type NotificationDeliveryChannel = 'email' | 'sms' | 'whatsapp' | 'in_app';

export interface NotificationLogSummary {
  id: string;
  tenantId: string | null;
  channel: string;
  templateKey: string | null;
  recipient: string | null;
  subject: string | null;
  body: string;
  status: NotificationDeliveryStatus;
  attempts: number;
  sentAt: string | null;
  failedAt: string | null;
  lastError: string | null;
  createdAt: string;
}
