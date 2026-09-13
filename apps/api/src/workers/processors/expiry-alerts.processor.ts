import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductStatus, type Tenant } from '@prisma/client';
import { domainEvents, workerJobs } from '@snacks/shared';
import type { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { NotificationTemplateService } from '../../modules/notifications/application/notification-template.service.js';
import { notificationTemplateKeys } from '../../modules/notifications/domain/notification-templates.js';

@Injectable()
@Processor(queues.expiryAlerts)
export class ExpiryAlertsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: NotificationTemplateService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<{ limit?: number }>) {
    if (job.name !== workerJobs.checkInventoryExpiryAlerts) {
      return { skipped: true };
    }

    const now = new Date();
    const alertDays = this.config.get<number>('INVENTORY_EXPIRY_ALERT_DAYS') ?? 3;
    const cutoff = new Date(now.getTime() + alertDays * 24 * 60 * 60 * 1000);
    const limit = job.data.limit ?? 100;
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        expiredAt: null,
        expiresAt: {
          gt: now,
          lte: cutoff
        }
      },
      include: {
        sku: {
          include: {
            product: true
          }
        }
      },
      orderBy: [{ expiresAt: 'asc' }, { updatedAt: 'desc' }],
      take: limit
    });

    const tenants = await this.prisma.tenant.findMany({
      where: {
        id: {
          in: [...new Set(batches.map((batch) => batch.tenantId))]
        }
      }
    });
    const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
    let alerted = 0;
    let skipped = 0;

    for (const batch of batches) {
      const available = Math.max(batch.quantity - batch.reserved, 0);
      if (available <= 0 || !batch.sku.active || batch.sku.product.status !== ProductStatus.active || !batch.expiresAt) {
        skipped += 1;
        continue;
      }

      const tenant = tenantById.get(batch.tenantId) ?? null;
      const recipient = this.adminAlertEmail(tenant);
      const batchCode = this.textFromRecord(this.objectRecord(batch.metadata), 'batchCode') ?? this.shortBatchCode(batch.id);
      const expiryDate = batch.expiresAt.toISOString();
      const daysRemaining = Math.max(1, Math.ceil((batch.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
      const result = await this.templates.createTemplateNotifications({
        tenantId: batch.tenantId,
        templateKey: notificationTemplateKeys.inventoryExpiringSoonAdminAlert,
        channels: ['email'],
        recipients: {
          email: recipient
        },
        context: {
          title: `${batch.sku.product.name} - ${batch.sku.name}`,
          message: `${batch.sku.product.name} ${batch.sku.name} batch ${batchCode} has ${available} sellable unit(s) and expires on ${expiryDate}. Update the expiry or adjust inventory before it becomes unsellable.`,
          actionLabel: 'Review inventory'
        },
        metadata: {
          source: 'inventory-expiry-alert-worker',
          eventName: domainEvents.inventoryBatchExpiringSoon,
          batchId: batch.id,
          skuId: batch.skuId,
          productId: batch.sku.productId,
          expiresAt: expiryDate,
          daysRemaining,
          available,
          batchCode
        },
        deliveryScope: `inventory-expiring-soon:${batch.id}:${expiryDate.slice(0, 10)}`
      });
      alerted += result.created;
    }

    return {
      checked: batches.length,
      alerted,
      skipped,
      windowDays: alertDays
    };
  }

  private adminAlertEmail(tenant: Tenant | null) {
    return (
      this.config.get<string>('ADMIN_ALERT_EMAIL') ??
      this.string(this.objectRecord(tenant?.metadata).adminEmail) ??
      tenant?.businessEmail ??
      null
    );
  }

  private string(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private objectRecord(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private textFromRecord(record: Record<string, unknown>, key: string) {
    const value = record[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private shortBatchCode(id: string) {
    return `B-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  }
}
