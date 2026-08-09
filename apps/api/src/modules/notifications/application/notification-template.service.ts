import { Injectable } from '@nestjs/common';
import { Prisma, type Notification, type Tenant } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import {
  domainEventNotificationTemplates,
  notificationTemplateRegistry,
  type NotificationChannel,
  type NotificationTemplateKey
} from '../domain/notification-templates.js';

interface CreateTemplateNotificationInput {
  tenantId: string | null;
  userId?: string | null;
  templateKey: NotificationTemplateKey;
  channels: NotificationChannel[];
  recipients: Partial<Record<NotificationChannel, string | null | undefined>>;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  deliveryScope: string;
}

@Injectable()
export class NotificationTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromDomainEvent(event: {
    id: string;
    name: string;
    tenantId: string | null;
    aggregateId: string;
    payload: Prisma.JsonValue;
  }) {
    const templateKey = domainEventNotificationTemplates[event.name];
    if (!templateKey || !event.tenantId) {
      return { created: 0, skipped: true };
    }

    const payload = this.object(event.payload);
    const orderId = typeof payload.orderId === 'string' ? payload.orderId : undefined;
    const userId = typeof payload.userId === 'string' ? payload.userId : undefined;
    const tenant = await this.prisma.tenant.findUnique({ where: { id: event.tenantId } });
    const order = orderId
      ? await this.prisma.order.findFirst({ where: { id: orderId, tenantId: event.tenantId } })
      : null;
    const user = userId
      ? await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, phone: true, name: true }
        })
      : null;
    const customer = order ? this.object(order.customer) : {};
    const tenantSettings = this.tenantSettings(tenant);
    const isAdminAlert = this.isAdminAlert(templateKey);
    const payloadEmail = this.string(payload.email);
    const payloadPhone = this.string(payload.phone);
    const customerEmail = payloadEmail ?? (typeof customer.email === 'string' ? customer.email : undefined) ?? user?.email ?? undefined;
    const customerPhone = payloadPhone ?? (typeof customer.phone === 'string' ? customer.phone : undefined) ?? user?.phone ?? undefined;
    const customerName =
      this.string(payload.customerName) ??
      this.string(payload.name) ??
      (typeof customer.name === 'string' ? customer.name : undefined) ??
      user?.name ??
      undefined;
    const adminEmail = tenant?.businessEmail ?? tenantSettings.adminEmail;
    const adminPhone = tenant?.businessPhone ?? tenantSettings.adminPhone;
    const channels = isAdminAlert ? tenantSettings.adminAlertChannels : tenantSettings.customerChannels;

    return this.createTemplateNotifications({
      tenantId: event.tenantId,
      templateKey,
      channels,
      recipients: {
        email: isAdminAlert ? adminEmail : customerEmail,
        sms: isAdminAlert ? adminPhone : customerPhone,
        whatsapp: isAdminAlert ? adminPhone : customerPhone,
        in_app: event.tenantId
      },
      context: {
        ...payload,
        orderId,
        customerName,
        reason: this.string(payload.reason),
        title: this.string(payload.title),
        message: this.string(payload.message),
        actionUrl: this.string(payload.actionUrl)
      },
      metadata: {
        source: 'outbox',
        outboxEventId: event.id,
        eventName: event.name,
        aggregateId: event.aggregateId
      },
      deliveryScope: event.id
    });
  }

  async createTemplateNotifications(input: CreateTemplateNotificationInput) {
    const tenant = input.tenantId ? await this.prisma.tenant.findUnique({ where: { id: input.tenantId } }) : null;
    const branding = this.branding(tenant);
    const template = notificationTemplateRegistry[input.templateKey]({
      brandName: branding.brandName,
      supportEmail: branding.supportEmail,
      supportPhone: branding.supportPhone,
      ...input.context
    });

    let created = 0;
    for (const channel of input.channels) {
      const recipient = input.recipients[channel];
      const deliveryKey = this.deliveryKey(input.tenantId, input.deliveryScope, input.templateKey, channel, recipient);
      const metadata = {
        ...(input.metadata ?? {}),
        templateKey: input.templateKey,
        channel,
        to: recipient ?? null,
        html: template.html,
        brandName: branding.brandName,
        supportEmail: branding.supportEmail,
        supportPhone: branding.supportPhone
      };

      await this.prisma.notification.upsert({
        where: { deliveryKey },
        update: {},
        create: {
          tenantId: input.tenantId,
          ...(input.userId ? { userId: input.userId } : {}),
          channel,
          templateKey: input.templateKey,
          recipient: recipient ?? null,
          deliveryKey,
          subject: template.subject,
          body: template.body,
          status: recipient ? 'pending' : 'skipped',
          lastError: recipient ? null : 'Recipient is missing.',
          metadata
        }
      });
      created += 1;
    }

    return { created, skipped: false };
  }

  renderForDelivery(notification: Notification) {
    const metadata = this.object(notification.metadata);
    const html = typeof metadata.html === 'string' ? metadata.html : `<p>${notification.body}</p>`;
    const to = notification.recipient || (typeof metadata.to === 'string' ? metadata.to : '');
    return {
      to,
      subject: notification.subject ?? 'Snacks Commerce',
      body: notification.body,
      html
    };
  }

  private branding(tenant: Tenant | null) {
    const metadata = this.object(tenant?.metadata ?? {});
    return {
      brandName: typeof metadata.brandName === 'string' ? metadata.brandName : tenant?.name ?? 'Snacks Commerce',
      supportEmail: tenant?.businessEmail ?? (typeof metadata.supportEmail === 'string' ? metadata.supportEmail : null),
      supportPhone: tenant?.businessPhone ?? (typeof metadata.supportPhone === 'string' ? metadata.supportPhone : null)
    };
  }

  private tenantSettings(tenant: Tenant | null): {
    customerChannels: NotificationChannel[];
    adminAlertChannels: NotificationChannel[];
    adminEmail?: string;
    adminPhone?: string;
  } {
    const metadata = this.object(tenant?.metadata ?? {});
    const rawChannels: unknown[] = Array.isArray(metadata.orderReadinessNotificationChannels)
      ? metadata.orderReadinessNotificationChannels
      : ['email'];
    const disabledChannels = Array.isArray(metadata.disabledNotificationChannels)
      ? metadata.disabledNotificationChannels.map((channel) => String(channel))
      : [];
    const customerChannels = rawChannels.filter((channel): channel is NotificationChannel =>
      ['email', 'sms', 'whatsapp', 'in_app'].includes(String(channel)),
    ).filter((channel) => !disabledChannels.includes(channel));
    const adminAlertChannels = Array.isArray(metadata.adminAlertNotificationChannels)
      ? metadata.adminAlertNotificationChannels.filter((channel): channel is NotificationChannel =>
          ['email', 'sms', 'whatsapp', 'in_app'].includes(String(channel)),
        ).filter((channel) => !disabledChannels.includes(channel))
      : disabledChannels.includes('email') ? [] : (['email'] satisfies NotificationChannel[]);
    const fallbackChannels: NotificationChannel[] = disabledChannels.includes('email') ? ['in_app'] : ['email'];

    return {
      customerChannels: customerChannels.length ? customerChannels : fallbackChannels,
      adminAlertChannels: adminAlertChannels.length ? adminAlertChannels : fallbackChannels,
      ...(typeof metadata.adminEmail === 'string' ? { adminEmail: metadata.adminEmail } : {}),
      ...(typeof metadata.adminPhone === 'string' ? { adminPhone: metadata.adminPhone } : {})
    };
  }

  private isAdminAlert(templateKey: NotificationTemplateKey) {
    return [
      'payment-proof-submitted-admin-alert',
      'payment-requires-attention',
      'refund-placeholder',
      'tenant-update',
      'settings-update',
      'vendor-access-update',
      'inventory-alert'
    ].includes(templateKey);
  }

  private string(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private deliveryKey(
    tenantId: string | null,
    deliveryScope: string,
    templateKey: NotificationTemplateKey,
    channel: NotificationChannel,
    recipient: string | null | undefined,
  ) {
    return [tenantId ?? 'platform', deliveryScope, templateKey, channel, recipient ?? 'missing'].join(':');
  }

  private object(value: Prisma.JsonValue | undefined) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
