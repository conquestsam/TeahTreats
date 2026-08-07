import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { domainEvents, type DomainEventName, type TenantSettings } from '@snacks/shared';
import { randomUUID } from 'node:crypto';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { OutboxService } from '../../outbox/application/outbox.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import type {
  CreateTenantDto,
  DeactivateTenantDto,
  ReactivateTenantDto,
  UpdateTenantDto
} from '../presentation/dto/admin-tenant.dto.js';

const defaultTimezone = 'America/New_York';
const defaultCurrency = 'USD';
const openOrderStatuses: OrderStatus[] = [
  OrderStatus.checkout_started,
  OrderStatus.inventory_reserved,
  OrderStatus.payment_pending,
  OrderStatus.manual_payment_proof_submitted,
  OrderStatus.awaiting_admin_payment_approval,
  OrderStatus.payment_approved,
  OrderStatus.paid,
  OrderStatus.preparing,
  OrderStatus.ready_for_pickup,
  OrderStatus.ready_for_pickup_dispatch
];

@Injectable()
export class AdminTenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async listTenants(actor: AuthenticatedUser) {
    const tenants = await this.prisma.tenant.findMany({
      where: this.isSuperAdmin(actor) ? {} : { id: { in: actor.tenantIds } },
      orderBy: [{ active: 'desc' }, { name: 'asc' }]
    });

    return tenants.map((tenant) => this.toTenantSummary(tenant));
  }

  async getTenant(actor: AuthenticatedUser, tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    this.ensureActorCanAccessTenant(actor, resolvedTenantId);
    const tenant = await this.findTenantOrThrow(resolvedTenantId);
    return this.toTenantSummary(tenant);
  }

  async createTenant(actor: AuthenticatedUser, dto: CreateTenantDto) {
    this.ensureSuperAdmin(actor, 'Only a super admin can create tenants.');
    const data = this.buildTenantCreateData(dto);

    const tenant = await this.prisma.tenant.create({
      data,
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A tenant with this slug already exists.');
      }
      throw error;
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: tenant.id,
      action: 'tenant.created',
      target: tenant.id,
      eventName: domainEvents.tenantCreated,
      payload: { tenantId: tenant.id, slug: tenant.slug }
    });

    return this.toTenantSummary(tenant);
  }

  async updateTenant(actor: AuthenticatedUser, tenantId: string, dto: UpdateTenantDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    const current = await this.findTenantOrThrow(resolvedTenantId);
    const tenant = await this.prisma.tenant.update({
      where: { id: current.id },
      data: this.buildTenantUpdateData(dto, current.metadata)
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A tenant with this slug already exists.');
      }
      throw error;
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: tenant.id,
      action: 'tenant.updated',
      target: tenant.id,
      eventName: domainEvents.tenantUpdated,
      payload: { tenantId: tenant.id, slug: tenant.slug }
    });

    return this.toTenantSummary(tenant);
  }

  async deactivateTenant(
    actor: AuthenticatedUser,
    tenantId: string,
    dto: DeactivateTenantDto,
  ) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    const tenant = await this.findTenantOrThrow(resolvedTenantId);
    if (!tenant.active) {
      return this.toTenantSummary(tenant);
    }

    const openOrders = await this.prisma.order.count({
      where: {
        tenantId: resolvedTenantId,
        status: { in: openOrderStatuses }
      }
    });

    if (openOrders > 0 && (!dto.force || !this.isSuperAdmin(actor))) {
      throw new BadRequestException(
        'This tenant has open orders. Resolve them first, or have a super admin force deactivation with a reason.',
      );
    }

    const updated = await this.prisma.tenant.update({
      where: { id: resolvedTenantId },
      data: {
        active: false,
        deactivatedAt: new Date()
      }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: updated.id,
      action: 'tenant.deactivated',
      target: updated.id,
      eventName: domainEvents.tenantDeactivated,
      payload: { tenantId: updated.id, reason: dto.reason.trim(), forced: Boolean(dto.force) }
    });

    return this.toTenantSummary(updated);
  }

  async reactivateTenant(
    actor: AuthenticatedUser,
    tenantId: string,
    dto: ReactivateTenantDto,
  ) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    const tenant = await this.findTenantOrThrow(resolvedTenantId);
    if (tenant.active) {
      return this.toTenantSummary(tenant);
    }

    const updated = await this.prisma.tenant.update({
      where: { id: resolvedTenantId },
      data: {
        active: true,
        deactivatedAt: null
      }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: updated.id,
      action: 'tenant.reactivated',
      target: updated.id,
      eventName: domainEvents.tenantReactivated,
      payload: { tenantId: updated.id, reason: dto.reason?.trim() ?? null }
    });

    return this.toTenantSummary(updated);
  }

  private buildTenantCreateData(dto: CreateTenantDto): Prisma.TenantUncheckedCreateInput {
    const metadata = this.buildTenantMetadata(dto, undefined);
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim().toLowerCase(),
      ...(dto.businessEmail ? { businessEmail: dto.businessEmail.trim().toLowerCase() } : {}),
      ...(dto.businessPhone ? { businessPhone: dto.businessPhone.trim() } : {}),
      delegatedRoleApprovalRequired: dto.delegatedRoleApprovalRequired ?? true,
      manualPaymentEnabled: dto.manualPaymentEnabled ?? true,
      defaultCurrency: dto.defaultCurrency?.trim().toUpperCase() ?? defaultCurrency,
      timezone: dto.timezone?.trim() ?? defaultTimezone,
      metadata: metadata as unknown as Prisma.InputJsonValue
    };
  }

  private buildTenantUpdateData(
    dto: CreateTenantDto | UpdateTenantDto,
    currentMetadata?: Prisma.JsonValue,
  ): Prisma.TenantUncheckedUpdateInput {
    return {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.slug !== undefined ? { slug: dto.slug.trim().toLowerCase() } : {}),
      ...(dto.businessEmail !== undefined
        ? { businessEmail: dto.businessEmail?.trim().toLowerCase() || null }
        : {}),
      ...(dto.businessPhone !== undefined
        ? { businessPhone: dto.businessPhone?.trim() || null }
        : {}),
      ...(dto.delegatedRoleApprovalRequired !== undefined
        ? { delegatedRoleApprovalRequired: dto.delegatedRoleApprovalRequired }
        : {}),
      ...(dto.manualPaymentEnabled !== undefined
        ? { manualPaymentEnabled: dto.manualPaymentEnabled }
        : {}),
      ...(dto.defaultCurrency !== undefined
        ? { defaultCurrency: dto.defaultCurrency.trim().toUpperCase() }
        : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone.trim() } : {}),
      metadata: this.buildTenantMetadata(dto, currentMetadata) as unknown as Prisma.InputJsonValue
    };
  }

  private buildTenantMetadata(
    dto: CreateTenantDto | UpdateTenantDto,
    currentMetadata?: Prisma.JsonValue,
  ) {
    const currentSettings = this.toTenantSettings(currentMetadata);
    const channels =
      dto.orderReadinessNotificationChannels ??
      currentSettings.orderReadinessNotificationChannels ??
      (['email'] as Array<'email' | 'sms' | 'whatsapp'>);
    const metadata: TenantSettings = {
      orderReadinessNotificationChannels: channels
    };
    const businessAddress = dto.businessAddress ?? currentSettings.businessAddress;
    if (businessAddress) {
      metadata.businessAddress = businessAddress;
    }
    return metadata;
  }

  private async ensureActorCanManageTenant(actor: AuthenticatedUser, tenantId: string) {
    this.ensureActorCanAccessTenant(actor, tenantId);
    if (this.isSuperAdmin(actor)) {
      return;
    }

    const hasTenantManage = actor.permissions.includes('tenants:manage');
    if (!hasTenantManage) {
      throw new ForbiddenException('You cannot manage tenants.');
    }
  }

  private ensureActorCanAccessTenant(actor: AuthenticatedUser, tenantId: string) {
    if (!this.isSuperAdmin(actor) && !actor.tenantIds.includes(tenantId)) {
      throw new ForbiddenException('You do not have access to this tenant.');
    }
  }

  private ensureSuperAdmin(actor: AuthenticatedUser, message: string) {
    if (!this.isSuperAdmin(actor)) {
      throw new ForbiddenException(message);
    }
  }

  private isSuperAdmin(actor: AuthenticatedUser) {
    return actor.permissions.includes('tenants:manage') && actor.permissions.includes('roles:manage');
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }]
      },
      select: { id: true }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant.id;
  }

  private async findTenantOrThrow(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant;
  }

  private toTenantSummary(tenant: {
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
    const channels: Array<'email' | 'sms' | 'whatsapp'> = Array.isArray(rawChannels)
      ? rawChannels.filter((channel): channel is 'email' | 'sms' | 'whatsapp' =>
          channel === 'email' || channel === 'sms' || channel === 'whatsapp',
        )
      : (['email'] as Array<'email' | 'sms' | 'whatsapp'>);

    const settings: TenantSettings = {
      orderReadinessNotificationChannels: channels.length
        ? channels
        : (['email'] as Array<'email' | 'sms' | 'whatsapp'>)
    };
    if (record.businessAddress && typeof record.businessAddress === 'object') {
      settings.businessAddress = record.businessAddress;
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
}
