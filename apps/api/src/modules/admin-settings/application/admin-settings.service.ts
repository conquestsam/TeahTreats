import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { domainEvents, type DomainEventName, type TenantSettings } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { OutboxService } from '../../outbox/application/outbox.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import type {
  CreateManualPaymentMethodDto,
  CreateDeliverySlotDto,
  UpdateApprovalSettingsDto,
  UpdateBusinessProfileDto,
  UpdateDeliverySlotDto,
  UpdateManualPaymentMethodDto,
  UpdateNotificationChannelsDto
} from '../presentation/dto/admin-settings.dto.js';

const defaultTimezone = 'America/New_York';
const defaultCurrency = 'USD';

@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async getSettings(actor: AuthenticatedUser, tenantId: string) {
    this.ensureCanReadSettings(actor);
    const tenant = await this.findTenantOrThrow(tenantId);
    const manualPaymentMethods = await this.listManualPaymentMethods(tenant.id);
    const deliverySlots = await this.listDeliverySlots(tenant.id);
    return {
      tenant: this.toTenantSettingsSummary(tenant),
      manualPaymentMethods,
      deliverySlots
    };
  }

  async updateBusinessProfile(
    actor: AuthenticatedUser,
    tenantId: string,
    dto: UpdateBusinessProfileDto,
  ) {
    const current = await this.findTenantOrThrow(tenantId);
    const currentSettings = this.toTenantSettings(current.metadata);
    const settings: TenantSettings = { ...currentSettings };
    if (dto.businessAddress) {
      settings.businessAddress = dto.businessAddress;
    }

    const tenant = await this.prisma.tenant.update({
      where: { id: current.id },
      data: {
        name: dto.name.trim(),
        businessEmail: dto.businessEmail?.trim().toLowerCase() || null,
        businessPhone: dto.businessPhone?.trim() || null,
        defaultCurrency: dto.defaultCurrency.trim().toUpperCase(),
        timezone: dto.timezone.trim(),
        metadata: settings as unknown as Prisma.InputJsonValue
      }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: tenant.id,
      action: 'settings.business_profile.updated',
      target: tenant.id,
      eventName: domainEvents.settingsBusinessProfileUpdated,
      payload: { tenantId: tenant.id }
    });

    return this.getSettings(actor, tenant.id);
  }

  async updateApprovalSettings(
    actor: AuthenticatedUser,
    tenantId: string,
    dto: UpdateApprovalSettingsDto,
  ) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        delegatedRoleApprovalRequired: dto.delegatedRoleApprovalRequired
      }
    }).catch((error: unknown) => {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('Tenant was not found.');
      }
      throw error;
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: tenant.id,
      action: 'settings.approval.updated',
      target: tenant.id,
      eventName: domainEvents.settingsApprovalUpdated,
      payload: {
        tenantId: tenant.id,
        delegatedRoleApprovalRequired: tenant.delegatedRoleApprovalRequired
      }
    });

    return this.getSettings(actor, tenant.id);
  }

  async updateNotificationChannels(
    actor: AuthenticatedUser,
    tenantId: string,
    dto: UpdateNotificationChannelsDto,
  ) {
    const current = await this.findTenantOrThrow(tenantId);
    const settings: TenantSettings = {
      ...this.toTenantSettings(current.metadata),
      orderReadinessNotificationChannels: dto.orderReadinessNotificationChannels.length
        ? dto.orderReadinessNotificationChannels
        : ['email']
    };

    const tenant = await this.prisma.tenant.update({
      where: { id: current.id },
      data: {
        metadata: settings as unknown as Prisma.InputJsonValue
      }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: tenant.id,
      action: 'settings.notification_channels.updated',
      target: tenant.id,
      eventName: domainEvents.settingsNotificationChannelsUpdated,
      payload: {
        tenantId: tenant.id,
        orderReadinessNotificationChannels: settings.orderReadinessNotificationChannels
      }
    });

    return this.getSettings(actor, tenant.id);
  }

  async listManualPaymentMethods(tenantId: string) {
    await this.findTenantOrThrow(tenantId);
    const methods = await this.prisma.manualPaymentMethod.findMany({
      where: { tenantId },
      orderBy: [{ active: 'desc' }, { label: 'asc' }]
    });

    return methods.map((method) => ({
      id: method.id,
      tenantId: method.tenantId,
      key: method.key,
      label: method.label,
      instructions: method.instructions,
      active: method.active,
      createdAt: method.createdAt.toISOString(),
      updatedAt: method.updatedAt.toISOString()
    }));
  }

  async createManualPaymentMethod(
    actor: AuthenticatedUser,
    tenantId: string,
    dto: CreateManualPaymentMethodDto,
  ) {
    await this.findTenantOrThrow(tenantId);
    const method = await this.prisma.manualPaymentMethod.create({
      data: {
        tenantId,
        key: dto.key.trim().toLowerCase(),
        label: dto.label.trim(),
        instructions: dto.instructions.trim(),
        active: dto.active ?? true
      }
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A payment method with this key already exists.');
      }
      throw error;
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: 'settings.manual_payment_method.created',
      target: method.id,
      eventName: domainEvents.settingsManualPaymentMethodCreated,
      payload: { tenantId, methodId: method.id, key: method.key }
    });

    return this.getSettings(actor, tenantId);
  }

  async updateManualPaymentMethod(
    actor: AuthenticatedUser,
    tenantId: string,
    methodId: string,
    dto: UpdateManualPaymentMethodDto,
  ) {
    await this.ensureManualPaymentMethodBelongsToTenant(tenantId, methodId);
    const method = await this.prisma.manualPaymentMethod.update({
      where: { id: methodId },
      data: {
        ...(dto.key !== undefined ? { key: dto.key.trim().toLowerCase() } : {}),
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.instructions !== undefined ? { instructions: dto.instructions.trim() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {})
      }
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A payment method with this key already exists.');
      }
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('Payment method was not found.');
      }
      throw error;
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: 'settings.manual_payment_method.updated',
      target: method.id,
      eventName: domainEvents.settingsManualPaymentMethodUpdated,
      payload: { tenantId, methodId: method.id, key: method.key }
    });

    return this.getSettings(actor, tenantId);
  }

  async setManualPaymentMethodStatus(
    actor: AuthenticatedUser,
    tenantId: string,
    methodId: string,
    active: boolean,
  ) {
    await this.ensureManualPaymentMethodBelongsToTenant(tenantId, methodId);
    const method = await this.prisma.manualPaymentMethod.update({
      where: { id: methodId },
      data: { active }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: active
        ? 'settings.manual_payment_method.activated'
        : 'settings.manual_payment_method.deactivated',
      target: method.id,
      eventName: domainEvents.settingsManualPaymentMethodStatusChanged,
      payload: { tenantId, methodId: method.id, key: method.key, active }
    });

    return this.getSettings(actor, tenantId);
  }

  async listDeliverySlots(tenantId: string) {
    await this.findTenantOrThrow(tenantId);
    const slots = await this.prisma.deliverySlot.findMany({
      where: { tenantId },
      orderBy: [{ active: 'desc' }, { startTime: 'asc' }, { label: 'asc' }]
    });
    const orderCounts = await this.prisma.order.groupBy({
      by: ['deliverySlotId'],
      where: {
        tenantId,
        deliverySlotId: { in: slots.map((slot) => slot.id) },
        status: {
          notIn: ['cancelled', 'expired', 'refunded']
        }
      },
      _count: { _all: true }
    });
    const counts = new Map(orderCounts.map((row) => [row.deliverySlotId, row._count._all]));

    return slots.map((slot) => {
      const bookedCount = counts.get(slot.id) ?? 0;
      return {
        id: slot.id,
        tenantId: slot.tenantId,
        label: slot.label,
        method: slot.method as 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery',
        startTime: slot.startTime,
        endTime: slot.endTime,
        feeCents: slot.feeCents,
        capacity: slot.capacity,
        cutoffTime: slot.cutoffTime,
        active: slot.active,
        hubId: slot.hubId,
        storeId: slot.storeId,
        bookedCount,
        remainingCapacity: Math.max(0, slot.capacity - bookedCount),
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString()
      };
    });
  }

  async createDeliverySlot(actor: AuthenticatedUser, tenantId: string, dto: CreateDeliverySlotDto) {
    await this.findTenantOrThrow(tenantId);
    const slot = await this.prisma.deliverySlot.create({
      data: this.deliverySlotData(tenantId, dto)
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: 'settings.delivery_slot.created',
      target: slot.id,
      eventName: domainEvents.settingsBusinessProfileUpdated,
      payload: { tenantId, slotId: slot.id }
    });

    return this.getSettings(actor, tenantId);
  }

  async updateDeliverySlot(
    actor: AuthenticatedUser,
    tenantId: string,
    slotId: string,
    dto: UpdateDeliverySlotDto,
  ) {
    await this.ensureDeliverySlotBelongsToTenant(tenantId, slotId);
    const slot = await this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: this.deliverySlotUpdateData(dto)
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: 'settings.delivery_slot.updated',
      target: slot.id,
      eventName: domainEvents.settingsBusinessProfileUpdated,
      payload: { tenantId, slotId: slot.id }
    });

    return this.getSettings(actor, tenantId);
  }

  async setDeliverySlotStatus(actor: AuthenticatedUser, tenantId: string, slotId: string, active: boolean) {
    await this.ensureDeliverySlotBelongsToTenant(tenantId, slotId);
    const slot = await this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: { active }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: active ? 'settings.delivery_slot.activated' : 'settings.delivery_slot.paused',
      target: slot.id,
      eventName: domainEvents.settingsBusinessProfileUpdated,
      payload: { tenantId, slotId: slot.id, active }
    });

    return this.getSettings(actor, tenantId);
  }

  private async ensureManualPaymentMethodBelongsToTenant(tenantId: string, methodId: string) {
    const method = await this.prisma.manualPaymentMethod.findFirst({
      where: { id: methodId, tenantId },
      select: { id: true }
    });
    if (!method) {
      throw new NotFoundException('Payment method was not found.');
    }
  }

  private async ensureDeliverySlotBelongsToTenant(tenantId: string, slotId: string) {
    const slot = await this.prisma.deliverySlot.findFirst({
      where: { id: slotId, tenantId },
      select: { id: true }
    });
    if (!slot) {
      throw new NotFoundException('Delivery slot was not found.');
    }
  }

  private deliverySlotData(tenantId: string, dto: CreateDeliverySlotDto) {
    return {
      tenantId,
      label: dto.label.trim(),
      method: dto.method,
      startTime: dto.startTime,
      endTime: dto.endTime,
      feeCents: dto.feeCents,
      capacity: dto.capacity,
      cutoffTime: dto.cutoffTime,
      active: dto.active ?? true,
      hubId: dto.hubId?.trim() || null,
      storeId: dto.storeId?.trim() || null
    };
  }

  private deliverySlotUpdateData(dto: UpdateDeliverySlotDto) {
    return {
      ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
      ...(dto.method !== undefined ? { method: dto.method } : {}),
      ...(dto.startTime !== undefined ? { startTime: dto.startTime } : {}),
      ...(dto.endTime !== undefined ? { endTime: dto.endTime } : {}),
      ...(dto.feeCents !== undefined ? { feeCents: dto.feeCents } : {}),
      ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
      ...(dto.cutoffTime !== undefined ? { cutoffTime: dto.cutoffTime } : {}),
      ...(dto.active !== undefined ? { active: dto.active } : {}),
      ...(dto.hubId !== undefined ? { hubId: dto.hubId.trim() || null } : {}),
      ...(dto.storeId !== undefined ? { storeId: dto.storeId.trim() || null } : {})
    };
  }

  private ensureCanReadSettings(actor: AuthenticatedUser) {
    const canRead =
      actor.permissions.includes('tenants:manage') ||
      actor.permissions.includes('manual-payments:review');
    if (!canRead) {
      throw new ForbiddenException('You cannot view tenant settings.');
    }
  }

  private async findTenantOrThrow(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant;
  }

  private toTenantSettingsSummary(tenant: {
    id: string;
    name: string;
    slug: string;
    businessEmail: string | null;
    businessPhone: string | null;
    active: boolean;
    delegatedRoleApprovalRequired: boolean;
    manualPaymentEnabled: boolean;
    defaultCurrency: string;
    timezone: string;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    deactivatedAt: Date | null;
  }) {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      businessEmail: tenant.businessEmail,
      businessPhone: tenant.businessPhone,
      active: tenant.active,
      delegatedRoleApprovalRequired: tenant.delegatedRoleApprovalRequired,
      manualPaymentEnabled: tenant.manualPaymentEnabled,
      defaultCurrency: tenant.defaultCurrency ?? defaultCurrency,
      timezone: tenant.timezone ?? defaultTimezone,
      settings: this.toTenantSettings(tenant.metadata),
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
      deactivatedAt: tenant.deactivatedAt?.toISOString() ?? null
    };
  }

  private toTenantSettings(metadata: Prisma.JsonValue | undefined): TenantSettings {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return { orderReadinessNotificationChannels: ['email'] };
    }

    const record = metadata as Record<string, unknown>;
    const rawChannels = record.orderReadinessNotificationChannels;
    const channels: TenantSettings['orderReadinessNotificationChannels'] = Array.isArray(rawChannels)
      ? rawChannels.filter((channel): channel is 'email' | 'sms' | 'whatsapp' =>
          channel === 'email' || channel === 'sms' || channel === 'whatsapp',
        )
      : ['email'];

    const settings: TenantSettings = {
      orderReadinessNotificationChannels: channels.length ? channels : ['email']
    };
    if (record.businessAddress && typeof record.businessAddress === 'object') {
      const businessAddress = record.businessAddress as TenantSettings['businessAddress'];
      if (businessAddress) {
        settings.businessAddress = businessAddress;
      }
    }

    return settings;
  }

  private async writeAuditAndEvent(input: {
    actorId: string;
    tenantId: string;
    action: string;
    target: string;
    eventName: DomainEventName;
    payload: Prisma.InputJsonValue;
  }) {
    await this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId,
        action: input.action,
        target: input.target,
        metadata: input.payload
      }
    });

    await this.outbox.enqueue({
      id: randomUUID(),
      name: input.eventName,
      tenantId: input.tenantId,
      aggregateId: input.target,
      payload: input.payload,
      occurredAt: new Date().toISOString()
    });
  }

  private isUniqueError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private isNotFoundError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
  }
}
