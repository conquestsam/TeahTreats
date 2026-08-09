import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EmailService } from '../../../infrastructure/notifications/email/email.service.js';
import { SmsService } from '../../../infrastructure/notifications/sms/sms.service.js';
import { WhatsappService } from '../../../infrastructure/notifications/whatsapp/whatsapp.service.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { notificationTemplateKeys, type NotificationChannel } from '../domain/notification-templates.js';
import { NotificationTemplateService } from './notification-template.service.js';

const allowedStatuses = ['pending', 'sent', 'failed', 'skipped', 'processing'] as const;
type NotificationStatusFilter = (typeof allowedStatuses)[number];

@Injectable()
export class AdminNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: NotificationTemplateService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async list(tenantIdOrSlug: string, status?: string) {
    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    const normalizedStatus = this.normalizeStatus(status);
    const notifications = await this.prisma.notification.findMany({
      where: {
        tenantId,
        ...(normalizedStatus ? { status: normalizedStatus } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return notifications.map((notification) => ({
      id: notification.id,
      tenantId: notification.tenantId,
      channel: notification.channel,
      templateKey: notification.templateKey,
      recipient: notification.recipient ?? this.recipientFromMetadata(notification.metadata),
      subject: notification.subject,
      body: notification.body,
      status: notification.status,
      attempts: notification.attempts,
      sentAt: notification.sentAt?.toISOString() ?? null,
      failedAt: notification.failedAt?.toISOString() ?? null,
      lastError: notification.lastError,
      createdAt: notification.createdAt.toISOString()
    }));
  }

  async retry(tenantIdOrSlug: string, notificationId: string) {
    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, tenantId }
    });
    if (!notification) {
      throw new NotFoundException('Notification was not found.');
    }
    if (!['failed', 'skipped'].includes(notification.status)) {
      throw new BadRequestException('Only failed or skipped notifications can be retried.');
    }
    const metadata = this.object(notification.metadata);
    const hasRecipient = Boolean(notification.recipient || metadata.to);

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: hasRecipient ? 'pending' : 'skipped',
        failedAt: null,
        processingAt: null,
        lastError: hasRecipient ? null : 'Recipient is missing.',
        nextAttemptAt: null
      }
    });

    return {
      id: updated.id,
      status: updated.status,
      attempts: updated.attempts,
      lastError: updated.lastError
    };
  }

  async smokeTest(
    tenantIdOrSlug: string,
    input: { channels?: NotificationChannel[]; email?: string; phone?: string },
  ) {
    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const channels = input.channels?.length ? input.channels : (['email'] satisfies NotificationChannel[]);
    const recipients: Partial<Record<NotificationChannel, string | null | undefined>> = {
      email: input.email ?? tenant?.businessEmail,
      sms: input.phone ?? tenant?.businessPhone,
      whatsapp: input.phone ?? tenant?.businessPhone,
      in_app: tenantId
    };
    const created = await this.templates.createTemplateNotifications({
      tenantId,
      templateKey: notificationTemplateKeys.promotionUpdate,
      channels,
      recipients,
      context: {
        title: 'TeahTreats smoke test',
        message: 'This is a TeahTreats notification smoke test from the admin panel.'
      },
      metadata: { source: 'admin-smoke-test' },
      deliveryScope: `smoke:${Date.now()}`
    });

    const notifications = await this.prisma.notification.findMany({
      where: {
        tenantId,
        metadata: {
          path: ['source'],
          equals: 'admin-smoke-test'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: channels.length
    });

    const results = [];
    for (const notification of notifications) {
      const rendered = this.templates.renderForDelivery(notification);
      try {
        const result = await this.deliverNow(notification.channel, rendered);
        const skipped = this.providerSkipped(result);
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: skipped ? 'skipped' : 'sent',
            attempts: { increment: 1 },
            sentAt: skipped ? null : new Date(),
            failedAt: null,
            lastError: skipped ? this.providerSkipReason(result) : null
          }
        });
        results.push({
          id: notification.id,
          channel: notification.channel,
          recipient: rendered.to,
          status: skipped ? 'skipped' : 'sent',
          message: skipped ? this.providerSkipReason(result) : 'Delivered or accepted by provider.'
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            attempts: { increment: 1 },
            failedAt: new Date(),
            lastError: message
          }
        });
        results.push({
          id: notification.id,
          channel: notification.channel,
          recipient: rendered.to,
          status: 'failed',
          message
        });
      }
    }

    return { created: created.created, results };
  }

  private normalizeStatus(status?: string): NotificationStatusFilter | undefined {
    if (!status) {
      return undefined;
    }
    if (!allowedStatuses.includes(status as NotificationStatusFilter)) {
      throw new BadRequestException('Notification status filter is invalid.');
    }
    return status as NotificationStatusFilter;
  }

  private recipientFromMetadata(value: Prisma.JsonValue) {
    const metadata = this.object(value);
    return typeof metadata.to === 'string' ? metadata.to : null;
  }

  private object(value: Prisma.JsonValue) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new BadRequestException('Tenant was not found.');
    }
    return tenant.id;
  }

  private deliverNow(channel: string, rendered: { to: string; subject: string; body: string; html: string }) {
    if (!rendered.to) {
      return Promise.resolve({ skipped: true, reason: 'Recipient is missing.' });
    }
    if (channel === 'email') {
      return this.email.sendTransactionalEmail({
        to: rendered.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.body
      });
    }
    if (channel === 'sms') {
      return this.sms.sendSms({ to: rendered.to, body: rendered.body });
    }
    if (channel === 'whatsapp') {
      return this.whatsapp.sendWhatsapp({ to: rendered.to, body: rendered.body });
    }
    if (channel === 'in_app') {
      return Promise.resolve({ skipped: false });
    }
    return Promise.resolve({ skipped: true, reason: `Unsupported channel: ${channel}` });
  }

  private providerSkipped(result: unknown) {
    return Boolean(result && typeof result === 'object' && 'skipped' in result && result.skipped === true);
  }

  private providerSkipReason(result: unknown) {
    return result && typeof result === 'object' && 'reason' in result && typeof result.reason === 'string'
      ? result.reason
      : 'Provider is not configured.';
  }
}
