import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

const allowedStatuses = ['pending', 'sent', 'failed', 'skipped', 'processing'] as const;
type NotificationStatusFilter = (typeof allowedStatuses)[number];

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
