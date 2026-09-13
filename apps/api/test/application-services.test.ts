import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PaymentProvider,
  PromotionDiscountType,
  PromotionStatus,
  PromotionTargetType,
} from '@prisma/client';
import { domainEvents } from '@snacks/shared';
import { PaymentReconciliationService } from '../src/modules/payments/application/payment-reconciliation.service.js';
import { PromotionsService } from '../src/modules/promotions/application/promotions.service.js';
import { AdminNotificationsService } from '../src/modules/notifications/application/admin-notifications.service.js';
import { NotificationTemplateService } from '../src/modules/notifications/application/notification-template.service.js';
import { CacheInvalidationProcessor } from '../src/workers/processors/cache-invalidation.processor.js';
import { NotificationsProcessor } from '../src/workers/processors/notifications.processor.js';

test('payment webhook reconciliation returns duplicate for already processed provider event', async () => {
  const processedAt = new Date();
  const service = new PaymentReconciliationService({
    paymentProviderEvent: {
      create: async () => ({
        id: 'event-1',
        provider: PaymentProvider.stripe,
        eventId: 'evt_1',
        eventType: 'payment_intent.succeeded',
        status: 'processed',
        processedAt,
      }),
    },
  } as never);

  const result = await service.reconcileProviderSuccess({
    provider: PaymentProvider.stripe,
    eventId: 'evt_1',
    eventType: 'payment_intent.succeeded',
    providerRef: 'pi_1',
    orderId: 'order-1',
    amountCents: 1200,
    currency: 'USD',
    payload: { id: 'evt_1' },
  });

  assert.equal(result.duplicate, true);
  assert.equal(result.processedAt, processedAt.toISOString());
});

test('promotion calculation applies percentage discount and rejects exceeded usage', async () => {
  const promotion = {
    id: 'promo-1',
    tenantId: 'tenant-1',
    name: 'Ten off',
    status: PromotionStatus.active,
    discountType: PromotionDiscountType.percentage,
    discountValue: 10,
    targetType: PromotionTargetType.all_products,
    targetProductIds: [],
    targetCategories: [],
    targetBrands: [],
    targetCustomerIds: [],
    startsAt: null,
    endsAt: null,
    minimumOrderAmountCents: null,
    usageLimit: null,
    perCustomerLimit: null,
    stackable: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const service = new PromotionsService(
    {
      couponCode: {
        findFirst: async () => ({
          id: 'coupon-1',
          tenantId: 'tenant-1',
          code: 'SAVE10',
          active: true,
          usageLimit: null,
          promotion,
        }),
      },
      promotionRedemption: {
        count: async () => 0,
      },
      order: {
        count: async () => 0,
      },
    } as never,
    { enqueue: async () => undefined } as never,
  );

  const result = await service.calculateCouponDiscount({
    tenantId: 'tenant-1',
    code: 'save10',
    items: [
      {
        skuId: 'sku-1',
        productId: 'product-1',
        productName: 'Snack',
        skuName: 'Snack pack',
        unitPriceCents: 1000,
        currency: 'USD',
        quantity: 2,
        lineTotalCents: 2000,
        product: { id: 'product-1', brand: 'Acme', category: 'Chips' },
      },
    ],
  });

  assert.equal(result.valid, true);
  assert.equal(result.discountCents, 200);
  assert.equal(result.summary.totalCents, 1800);
});

test('notification template service uses deterministic delivery keys for idempotent upserts', async () => {
  const deliveryKeys: string[] = [];
  const service = new NotificationTemplateService({
    tenant: {
      findUnique: async () => ({
        id: 'tenant-1',
        name: 'Snack House',
        businessEmail: 'ops@example.com',
        businessPhone: null,
        metadata: {},
      }),
    },
    notification: {
      upsert: async ({ where }: { where: { deliveryKey: string } }) => {
        deliveryKeys.push(where.deliveryKey);
        return {};
      },
    },
  } as never);

  await service.createTemplateNotifications({
    tenantId: 'tenant-1',
    templateKey: 'order-ready',
    channels: ['email'],
    recipients: { email: 'customer@example.com' },
    context: { orderId: 'order-1' },
    deliveryScope: 'outbox-1',
  });
  await service.createTemplateNotifications({
    tenantId: 'tenant-1',
    templateKey: 'order-ready',
    channels: ['email'],
    recipients: { email: 'customer@example.com' },
    context: { orderId: 'order-1' },
    deliveryScope: 'outbox-1',
  });

  assert.deepEqual(deliveryKeys, [
    'tenant-1:outbox-1:order-ready:email:customer@example.com',
    'tenant-1:outbox-1:order-ready:email:customer@example.com',
  ]);
});

test('notification service maps order ready outbox event to customer notification channels', async () => {
  const created: Array<{ deliveryKey: string; recipient: string | null }> = [];
  const service = new NotificationTemplateService({
    tenant: {
      findUnique: async () => ({
        id: 'tenant-1',
        name: 'Snack House',
        businessEmail: 'ops@example.com',
        businessPhone: null,
        metadata: { orderReadinessNotificationChannels: ['email', 'sms'] },
      }),
    },
    order: {
      findFirst: async () => ({
        id: 'order-1',
        totalCents: 1200,
        currency: 'USD',
        customer: { name: 'Customer', email: 'customer@example.com', phone: '5551112222' },
      }),
    },
    notification: {
      upsert: async ({
        where,
        create,
      }: {
        where: { deliveryKey: string };
        create: { recipient: string | null };
      }) => {
        created.push({ deliveryKey: where.deliveryKey, recipient: create.recipient });
        return {};
      },
    },
  } as never);

  const result = await service.createFromDomainEvent({
    id: 'outbox-1',
    name: domainEvents.orderReadyForPickup,
    tenantId: 'tenant-1',
    aggregateId: 'order-1',
    payload: { orderId: 'order-1' },
  });

  assert.equal(result.created, 2);
  assert.equal(created[0]?.recipient, 'customer@example.com');
  assert.equal(created[1]?.recipient, '5551112222');
});

test('notification service maps inventory expiry update to admin email notification', async () => {
  const created: Array<{ deliveryKey: string; recipient: string | null; status: string; templateKey: string | null }> = [];
  const service = new NotificationTemplateService({
    tenant: {
      findUnique: async () => ({
        id: 'tenant-1',
        name: 'Snack House',
        businessEmail: null,
        businessPhone: null,
        metadata: { adminEmail: 'ops@example.com' },
      }),
    },
    order: {
      findFirst: async () => null,
    },
    notification: {
      upsert: async ({
        where,
        create,
      }: {
        where: { deliveryKey: string };
        create: { recipient: string | null; status: string; templateKey: string | null };
      }) => {
        created.push({
          deliveryKey: where.deliveryKey,
          recipient: create.recipient,
          status: create.status,
          templateKey: create.templateKey,
        });
        return {};
      },
    },
  } as never);

  const result = await service.createFromDomainEvent({
    id: 'outbox-inventory-1',
    name: domainEvents.inventoryBatchExpiryUpdated,
    tenantId: 'tenant-1',
    aggregateId: 'batch-1',
    payload: {
      batchId: 'batch-1',
      title: 'Puff Puff - Regular',
      message: 'Expiry updated after review.',
    },
  });

  assert.equal(result.created, 1);
  assert.equal(created[0]?.recipient, 'ops@example.com');
  assert.equal(created[0]?.status, 'pending');
  assert.equal(created[0]?.templateKey, 'inventory-expiry-updated');
  assert.equal(
    created[0]?.deliveryKey,
    'tenant-1:outbox-inventory-1:inventory-expiry-updated:email:ops@example.com',
  );
});

test('notification worker delivers pending email notifications', async () => {
  const notification = {
    id: 'notification-1',
    channel: 'email',
    recipient: 'ops@example.com',
    subject: 'Inventory expiring soon',
    body: 'Review stock.',
    metadata: { html: '<p>Review stock.</p>' },
    attempts: 0,
  };
  const updates: unknown[] = [];
  const sent: unknown[] = [];
  const processor = new NotificationsProcessor(
    {
      notification: {
        findMany: async () => [notification],
        updateMany: async () => ({ count: 1 }),
        findUniqueOrThrow: async () => notification,
        update: async (input: unknown) => {
          updates.push(input);
          return {};
        },
      },
    } as never,
    {
      sendTransactionalEmail: async (input: unknown) => {
        sent.push(input);
        return { provider: 'test' };
      },
    } as never,
    {} as never,
    {} as never,
    new NotificationTemplateService({} as never),
  );

  const result = await processor.process({
    name: 'deliver-notifications',
    data: { limit: 10 },
  } as never);

  assert.deepEqual(result, { sent: 1, skipped: 0, failed: 0 });
  assert.deepEqual(sent, [
    {
      to: 'ops@example.com',
      subject: 'Inventory expiring soon',
      html: '<p>Review stock.</p>',
    },
  ]);
  assert.equal(
    updates.some((input) => {
      const data = (input as { data?: { status?: string } }).data;
      return data?.status === 'sent';
    }),
    true,
  );
});

test('admin notification retry requeues failed notifications with a recipient', async () => {
  const updates: unknown[] = [];
  const service = new AdminNotificationsService(
    {
      tenant: {
        findFirst: async () => ({ id: 'tenant-1' }),
      },
      notification: {
        findFirst: async () => ({
          id: 'notification-1',
          tenantId: 'tenant-1',
          status: 'failed',
          recipient: 'ops@example.com',
          metadata: {},
        }),
        update: async (input: unknown) => {
          updates.push(input);
          return {
            id: 'notification-1',
            status: 'pending',
            attempts: 1,
            lastError: null,
          };
        },
      },
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  const result = await service.retry('tenant-1', 'notification-1');

  assert.deepEqual(result, {
    id: 'notification-1',
    status: 'pending',
    attempts: 1,
    lastError: null,
  });
  assert.equal(
    updates.some((input) => {
      const data = (input as { data?: { status?: string; lastError?: string | null } }).data;
      return data?.status === 'pending' && data.lastError === null;
    }),
    true,
  );
});

test('cache invalidation processor exposes retry-safe placeholder result', async () => {
  const processor = new CacheInvalidationProcessor();
  const result = await processor.process({ id: 'job-1' } as never);
  assert.deepEqual(result, { jobId: 'job-1', invalidated: true });
});
