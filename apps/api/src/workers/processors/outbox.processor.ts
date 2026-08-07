import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { domainEvents, realtimeEventTypes, realtimeTopics, workerJobs } from '@snacks/shared';
import type { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';
import { RedisService } from '../../infrastructure/redis/redis.service.js';
import { OpenSearchService } from '../../infrastructure/search/opensearch.service.js';
import { Prisma, type OutboxEvent } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { NotificationTemplateService } from '../../modules/notifications/application/notification-template.service.js';
import { RealtimeEventsService } from '../../realtime/realtime-events.service.js';

@Processor(queues.outbox)
export class OutboxProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeEventsService,
    private readonly redis: RedisService,
    private readonly search: OpenSearchService,
    private readonly notifications: NotificationTemplateService,
  ) {
    super();
  }

  async process(job: Job<{ limit?: number }>) {
    if (job.name !== workerJobs.processOutbox) {
      return { skipped: true };
    }

    const limit = job.data.limit ?? 50;
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        processedAt: null,
        attempts: { lt: 10 }
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    let processed = 0;
    let failed = 0;

    for (const event of events) {
      try {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { attempts: { increment: 1 } }
        });
        await this.handleEvent(event);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date() }
        });
        processed += 1;
      } catch (error) {
        failed += 1;
        this.logger.error(
          JSON.stringify({
            message: 'Outbox event failed',
            eventId: event.id,
            name: event.name,
            tenantId: event.tenantId,
            error: error instanceof Error ? error.message : String(error)
          }),
        );
      }
    }

    return { processed, failed };
  }

  private async handleEvent(event: OutboxEvent) {
    await this.publishRealtime(event);
    await this.handleNotifications(event);
    await this.handleCacheInvalidation(event);
    await this.handleSearchSync(event);
  }

  private async handleNotifications(event: OutboxEvent) {
    await this.notifications.createFromDomainEvent(event);
  }

  private async publishRealtime(event: OutboxEvent) {
    if (!event.tenantId) {
      return;
    }

    const payload = this.payload(event.payload);
    const orderId = typeof payload.orderId === 'string' ? payload.orderId : undefined;
    const realtimeType = this.realtimeType(event.name);
    if (!realtimeType) {
      return;
    }

    await this.realtime.publish({
      topic: realtimeTopics.adminTenant,
      type: realtimeType,
      tenantId: event.tenantId,
      ...(orderId ? { orderId } : {}),
      payload: {
        id: event.id,
        name: event.name,
        aggregateId: event.aggregateId,
        ...payload
      }
    });

    if (orderId) {
      await this.realtime.publish({
        topic: realtimeTopics.customerOrder,
        type: realtimeType,
        tenantId: event.tenantId,
        orderId,
        payload: {
          id: event.id,
          name: event.name,
          aggregateId: event.aggregateId,
          ...payload
        }
      });
    }
  }

  private async handleCacheInvalidation(event: OutboxEvent) {
    const payload = this.payload(event.payload);
    const sideEffects = Array.isArray(payload.sideEffects) ? payload.sideEffects : [];
    if (!sideEffects.includes('cache.invalidate') && !sideEffects.includes('cart.cache.invalidate')) {
      return;
    }

    await this.redis.client.publish(
      'cache:invalidate',
      JSON.stringify({
        eventId: event.id,
        name: event.name,
        tenantId: event.tenantId,
        aggregateId: event.aggregateId
      }),
    );
  }

  private async handleSearchSync(event: OutboxEvent) {
    const payload = this.payload(event.payload);
    const sideEffects = Array.isArray(payload.sideEffects) ? payload.sideEffects : [];
    if (event.name !== domainEvents.productChanged && !sideEffects.includes('search.sync')) {
      return;
    }

    const productId = typeof payload.productId === 'string' ? payload.productId : event.aggregateId;
    await this.searchProductPlaceholder(productId, event.tenantId);
  }

  private async searchProductPlaceholder(productId: string, tenantId: string | null) {
    try {
      await this.search.indexProduct({
        id: productId,
        tenantId,
        syncedFrom: 'outbox',
        syncedAt: new Date().toISOString()
      });
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          message: 'OpenSearch placeholder sync skipped or failed',
          productId,
          error: error instanceof Error ? error.message : String(error)
        }),
      );
    }
  }

  private realtimeType(name: string) {
    if (
      name === domainEvents.orderStatusChanged ||
      name === domainEvents.orderPaid ||
      name === domainEvents.orderPreparing ||
      name === domainEvents.orderCompleted ||
      name === domainEvents.orderCancelled ||
      name === domainEvents.orderExpired ||
      name === domainEvents.orderPaymentPending ||
      name === domainEvents.orderPaymentFailed
    ) {
      return realtimeEventTypes.orderStatusChanged;
    }
    if (name === domainEvents.orderReadyForPickup || name === domainEvents.orderReadyForPickupDispatch) {
      return realtimeEventTypes.orderReady;
    }
    if (name === domainEvents.manualProofSubmitted || name === domainEvents.manualPaymentProofSubmitted) {
      return realtimeEventTypes.paymentProofSubmitted;
    }
    if (name === domainEvents.manualProofApproved || name === domainEvents.manualProofRejected) {
      return realtimeEventTypes.paymentProofReviewed;
    }
    if (name.startsWith('inventory.')) {
      return realtimeEventTypes.inventoryChanged;
    }
    if (name.startsWith('catalog.')) {
      return realtimeEventTypes.productChanged;
    }
    if (name === domainEvents.cartUpdated) {
      return realtimeEventTypes.cartChanged;
    }
    return null;
  }

  private payload(value: Prisma.JsonValue) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
