import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { workerJobs } from '@snacks/shared';
import type { Job } from 'bullmq';
import { EmailService } from '../../infrastructure/notifications/email/email.service.js';
import { SmsService } from '../../infrastructure/notifications/sms/sms.service.js';
import { WhatsappService } from '../../infrastructure/notifications/whatsapp/whatsapp.service.js';
import { queues } from '../../infrastructure/queue/queue.module.js';
import type { Notification } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { NotificationTemplateService } from '../../modules/notifications/application/notification-template.service.js';

@Processor(queues.notifications)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly whatsapp: WhatsappService,
    private readonly templates: NotificationTemplateService,
  ) {
    super();
  }

  async process(job: Job<{ limit?: number }>) {
    if (job.name !== workerJobs.deliverNotifications) {
      return { skipped: true };
    }

    const notifications = await this.prisma.notification.findMany({
      where: {
        attempts: { lt: 5 },
        OR: [
          { status: { in: ['pending', 'failed'] }, nextAttemptAt: null },
          { status: { in: ['pending', 'failed'] }, nextAttemptAt: { lte: new Date() } },
          { status: 'processing', nextAttemptAt: { lte: new Date() } }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: job.data.limit ?? 50
    });

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        const claimed = await this.prisma.notification.updateMany({
          where: {
            id: notification.id,
            sentAt: null,
            attempts: { lt: 5 },
            OR: [
              { status: { in: ['pending', 'failed'] } },
              { status: 'processing', nextAttemptAt: { lte: new Date() } }
            ]
          },
          data: {
            status: 'processing',
            attempts: { increment: 1 },
            processingAt: new Date(),
            nextAttemptAt: this.processingTimeoutAt(),
            lastError: null
          }
        });
        if (claimed.count === 0) {
          skipped += 1;
          continue;
        }

        const claimedNotification = await this.prisma.notification.findUniqueOrThrow({
          where: { id: notification.id }
        });
        const result = await this.deliver(claimedNotification);
        if (result.skipped) {
          await this.markSkipped(notification.id, result.reason);
          skipped += 1;
        } else {
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              processingAt: null,
              failedAt: null,
              lastError: null,
              nextAttemptAt: null
            }
          });
          sent += 1;
        }
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            processingAt: null,
            failedAt: new Date(),
            lastError: message,
            nextAttemptAt: this.nextAttemptAt(notification.attempts + 1)
          }
        });
        this.logger.error(
          JSON.stringify({
            message: 'Notification delivery failed',
            notificationId: notification.id,
            channel: notification.channel,
            error: message
          }),
        );
      }
    }

    return { sent, skipped, failed };
  }

  private async deliver(notification: Notification) {
    const rendered = this.templates.renderForDelivery(notification);
    const to = rendered.to;
    if (!to) {
      return { skipped: true, reason: 'Recipient is missing.' };
    }

    if (notification.channel === 'email') {
      const result = await this.email.sendTransactionalEmail({
        to,
        subject: rendered.subject,
        html: rendered.html
      });
      return this.normalizeProviderResult(result);
    }
    if (notification.channel === 'sms') {
      return this.normalizeProviderResult(await this.sms.sendSms({ to, body: rendered.body }));
    }
    if (notification.channel === 'whatsapp') {
      return this.normalizeProviderResult(await this.whatsapp.sendWhatsapp({ to, body: rendered.body }));
    }
    if (notification.channel === 'in_app') {
      return { skipped: false, reason: '' };
    }

    return { skipped: true, reason: `Unsupported channel: ${notification.channel}` };
  }

  private async markSkipped(notificationId: string, reason: string) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'skipped',
        processingAt: null,
        failedAt: null,
        lastError: reason,
        nextAttemptAt: null
      }
    });
  }

  private normalizeProviderResult(result: unknown) {
    if (result && typeof result === 'object' && 'skipped' in result && result.skipped === true) {
      return {
        skipped: true,
        reason: 'reason' in result && typeof result.reason === 'string' ? result.reason : 'Provider is not configured.'
      };
    }
    return { skipped: false, reason: '' };
  }

  private nextAttemptAt(attempts: number) {
    const minutes = Math.min(60, 2 ** Math.max(0, attempts - 1));
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private processingTimeoutAt() {
    return new Date(Date.now() + 10 * 60 * 1000);
  }
}
