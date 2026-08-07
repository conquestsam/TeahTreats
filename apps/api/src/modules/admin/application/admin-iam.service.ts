import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { domainEvents, permissions as sharedPermissions } from '@snacks/shared';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import {
  ApprovalStatus,
  Prisma,
  type Role,
  type UserRole
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { OutboxService } from '../../outbox/application/outbox.service.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import type {
  AssignUserRoleDto,
  CreateAdminRoleDto,
  CreateAdminUserDto,
  RejectApprovalDto,
  UpdateAdminUserDto
} from '../presentation/dto/admin-iam.dto.js';

const superAdminRoleName = 'super-admin';
const defaultTemporaryPassword = 'Password#23';

const roleInclude = {
  permissions: {
    include: {
      permission: true
    }
  }
} as const;

const userInclude = {
  roles: {
    include: {
      tenant: true,
      role: {
        include: roleInclude
      }
    },
    orderBy: {
      role: {
        name: 'asc' as const
      }
    }
  }
} as const;

const approvalInclude = {
  targetUser: true,
  role: {
    include: roleInclude
  },
  requestedBy: true
} as const;

@Injectable()
export class AdminIamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async listUsers(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: { tenantId: resolvedTenantId }
        }
      },
      include: userInclude,
      orderBy: { createdAt: 'desc' }
    });

    return users.map((user) => this.toUserSummary(user));
  }

  async createUser(actor: AuthenticatedUser, tenantId: string, dto: CreateAdminUserDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });
    if (existing) {
      throw new ConflictException('This email is already in use by another user.');
    }

    const passwordHash = await argon2.hash(dto.temporaryPassword ?? defaultTemporaryPassword);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name.trim(),
        ...(dto.phone ? { phone: dto.phone.trim() } : {}),
        passwordHash
      },
      include: userInclude
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: resolvedTenantId,
      action: 'iam.user-created',
      target: user.id,
      eventName: domainEvents.adminUserCreated,
      payload: { userId: user.id, email: user.email }
    });

    return this.toUserSummary(user);
  }

  async updateUser(actor: AuthenticatedUser, tenantId: string, userId: string, dto: UpdateAdminUserDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    await this.ensureUserBelongsToTenant(userId, resolvedTenantId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone?.trim() } : {})
      },
      include: userInclude
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: resolvedTenantId,
      action: 'iam.user-updated',
      target: user.id,
      eventName: domainEvents.adminUserUpdated,
      payload: { userId: user.id }
    });

    return this.toUserSummary(user);
  }

  async listRoles(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [{ tenantId: resolvedTenantId }, { tenantId: null }]
      },
      include: roleInclude,
      orderBy: { name: 'asc' }
    });

    return roles.map((role) => this.toRoleSummary(role));
  }

  async createRole(actor: AuthenticatedUser, tenantId: string, dto: CreateAdminRoleDto) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    await this.ensureAssignablePermissions(actor, dto.permissions);
    const permissions = await this.findPermissionsOrThrow(dto.permissions);

    const role = await this.prisma.role.create({
      data: {
        tenantId: resolvedTenantId,
        name: dto.name.trim().toLowerCase(),
        permissions: {
          create: permissions.map((permission) => ({
            permissionId: permission.id
          }))
        }
      },
      include: roleInclude
    }).catch((error: unknown) => {
      if (this.isUniqueError(error)) {
        throw new ConflictException('A role with this name already exists.');
      }
      throw error;
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: resolvedTenantId,
      action: 'iam.role-created',
      target: role.id,
      eventName: domainEvents.roleCreated,
      payload: { roleId: role.id, name: role.name }
    });

    return this.toRoleSummary(role);
  }

  listPermissions() {
    return Object.values(sharedPermissions);
  }

  async listTenants(actor: AuthenticatedUser) {
    const tenants = await this.prisma.tenant.findMany({
      where: this.isSuperAdmin(actor) ? {} : { id: { in: actor.tenantIds } },
      orderBy: { name: 'asc' }
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      delegatedRoleApprovalRequired: tenant.delegatedRoleApprovalRequired
    }));
  }

  async assignUserRole(
    actor: AuthenticatedUser,
    currentTenantId: string,
    userId: string,
    dto: AssignUserRoleDto,
  ) {
    const resolvedTenantId = await this.resolveTenantId(dto.tenantId);
    const currentResolvedTenantId = await this.resolveTenantId(currentTenantId);
    if (resolvedTenantId !== currentResolvedTenantId && !this.isSuperAdmin(actor)) {
      throw new ForbiddenException('You cannot assign access outside the current tenant.');
    }

    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    const role = await this.findTenantRoleOrThrow(dto.roleId, resolvedTenantId);
    await this.ensureAssignablePermissions(
      actor,
      role.permissions.map((rolePermission) => rolePermission.permission.key),
    );
    await this.ensureUserExists(userId);

    const duplicate = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId_tenantId: {
          userId,
          roleId: role.id,
          tenantId: resolvedTenantId
        }
      }
    });
    if (duplicate) {
      throw new ConflictException('This role is already assigned.');
    }

    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: resolvedTenantId } });
    if (!this.isSuperAdmin(actor) && tenant.delegatedRoleApprovalRequired) {
      const approval = await this.prisma.roleChangeApproval.create({
        data: {
          tenantId: resolvedTenantId,
          targetUserId: userId,
          roleId: role.id,
          action: 'assign',
          requestedById: actor.id,
          ...(dto.reason ? { reason: dto.reason.trim() } : {})
        },
        include: approvalInclude
      });

      await this.writeAuditAndEvent({
        actorId: actor.id,
        tenantId: resolvedTenantId,
        action: 'iam.role-approval-requested',
        target: approval.id,
        eventName: domainEvents.roleApprovalRequested,
        payload: { approvalId: approval.id, userId, roleId: role.id }
      });

      return { approval: this.toApprovalSummary(approval), userRole: null };
    }

    const userRole = await this.createUserRole(actor, resolvedTenantId, userId, role);
    return { approval: null, userRole };
  }

  async removeUserRole(actor: AuthenticatedUser, tenantId: string, userRoleId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    const userRole = await this.prisma.userRole.findFirst({
      where: { id: userRoleId, tenantId: resolvedTenantId },
      include: {
        role: {
          include: roleInclude
        }
      }
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment was not found.');
    }

    await this.ensureAssignablePermissions(
      actor,
      userRole.role.permissions.map((rolePermission) => rolePermission.permission.key),
    );
    await this.ensureNotRemovingOwnFinalSuperAdmin(actor, userRole);

    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.delete({ where: { id: userRole.id } });
      await tx.auditLog.create({
        data: {
          tenantId: resolvedTenantId,
          actorId: actor.id,
          action: 'iam.role-removed',
          target: userRole.id,
          metadata: { userId: userRole.userId, roleId: userRole.roleId }
        }
      });
    });

    await this.outbox.enqueue(this.event(actor.id, resolvedTenantId, domainEvents.roleRemoved, {
      userRoleId: userRole.id,
      userId: userRole.userId,
      roleId: userRole.roleId
    }));

    return { ok: true };
  }

  async listApprovals(tenantId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const approvals = await this.prisma.roleChangeApproval.findMany({
      where: { tenantId: resolvedTenantId, status: ApprovalStatus.pending },
      include: approvalInclude,
      orderBy: { createdAt: 'desc' }
    });

    return approvals.map((approval) => this.toApprovalSummary(approval));
  }

  async approveRoleChange(actor: AuthenticatedUser, tenantId: string, approvalId: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    if (!this.isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can approve delegated role changes.');
    }

    const approval = await this.findPendingApproval(approvalId, resolvedTenantId);
    const userRole = await this.createUserRole(actor, resolvedTenantId, approval.targetUserId, approval.role);
    await this.prisma.roleChangeApproval.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.approved,
        reviewedById: actor.id,
        reviewedAt: new Date()
      }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: resolvedTenantId,
      action: 'iam.role-approval-approved',
      target: approval.id,
      eventName: domainEvents.roleApprovalApproved,
      payload: { approvalId: approval.id, userRoleId: userRole.id }
    });

    return userRole;
  }

  async rejectRoleChange(
    actor: AuthenticatedUser,
    tenantId: string,
    approvalId: string,
    dto: RejectApprovalDto,
  ) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    await this.ensureActorCanManageTenant(actor, resolvedTenantId);
    if (!this.isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a super admin can reject delegated role changes.');
    }

    const approval = await this.findPendingApproval(approvalId, resolvedTenantId);
    const rejected = await this.prisma.roleChangeApproval.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.rejected,
        reviewedById: actor.id,
        reviewedAt: new Date(),
        reason: dto.reason?.trim() ?? approval.reason
      },
      include: approvalInclude
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId: resolvedTenantId,
      action: 'iam.role-approval-rejected',
      target: approval.id,
      eventName: domainEvents.roleApprovalRejected,
      payload: { approvalId: approval.id }
    });

    return this.toApprovalSummary(rejected);
  }

  private async createUserRole(
    actor: AuthenticatedUser,
    tenantId: string,
    userId: string,
    role: RoleWithPermissions,
  ) {
    const userRole = await this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
        tenantId
      },
      include: {
        role: {
          include: roleInclude
        },
        tenant: true
      }
    });

    await this.writeAuditAndEvent({
      actorId: actor.id,
      tenantId,
      action: 'iam.role-assigned',
      target: userRole.id,
      eventName: domainEvents.roleAssigned,
      payload: { userRoleId: userRole.id, userId, roleId: role.id }
    });

    return this.toUserRoleSummary(userRole);
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User was not found.');
    }
  }

  private async ensureUserBelongsToTenant(userId: string, tenantId: string) {
    const count = await this.prisma.userRole.count({ where: { userId, tenantId } });
    if (count === 0) {
      throw new NotFoundException('User was not found for this tenant.');
    }
  }

  private async ensureActorCanManageTenant(actor: AuthenticatedUser, tenantId: string) {
    if (this.isSuperAdmin(actor)) {
      return;
    }
    if (!actor.tenantIds.includes(tenantId)) {
      throw new ForbiddenException('You cannot manage this tenant.');
    }
  }

  private async ensureAssignablePermissions(actor: AuthenticatedUser, requestedPermissions: string[]) {
    if (this.isSuperAdmin(actor)) {
      return;
    }

    const actorPermissions = new Set(actor.permissions);
    const disallowed = requestedPermissions.filter((permission) => !actorPermissions.has(permission));
    if (disallowed.length > 0) {
      throw new ForbiddenException('You cannot assign permissions outside your access.');
    }
  }

  private async ensureNotRemovingOwnFinalSuperAdmin(actor: AuthenticatedUser, userRole: UserRole & { role: Role }) {
    if (actor.id !== userRole.userId || userRole.role.name !== superAdminRoleName) {
      return;
    }

    const remainingSuperAdminRoles = await this.prisma.userRole.count({
      where: {
        userId: actor.id,
        id: { not: userRole.id },
        role: { name: superAdminRoleName }
      }
    });
    if (remainingSuperAdminRoles === 0) {
      throw new BadRequestException('You cannot remove your own final super admin access.');
    }
  }

  private isSuperAdmin(actor: AuthenticatedUser) {
    return Object.values(sharedPermissions).every((permission) => actor.permissions.includes(permission));
  }

  private async findPermissionsOrThrow(keys: string[]) {
    const uniqueKeys = [...new Set(keys)];
    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: uniqueKeys } }
    });
    if (permissions.length !== uniqueKeys.length) {
      throw new BadRequestException('One or more permissions are invalid.');
    }
    return permissions;
  }

  private async findTenantRoleOrThrow(roleId: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [{ tenantId }, { tenantId: null }]
      },
      include: roleInclude
    });
    if (!role) {
      throw new NotFoundException('Role was not found.');
    }
    return role;
  }

  private async findPendingApproval(approvalId: string, tenantId: string) {
    const approval = await this.prisma.roleChangeApproval.findFirst({
      where: { id: approvalId, tenantId, status: ApprovalStatus.pending },
      include: approvalInclude
    });
    if (!approval) {
      throw new NotFoundException('Approval request was not found.');
    }
    return approval;
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }]
      }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant.id;
  }

  private async writeAuditAndEvent(input: {
    actorId: string;
    tenantId: string;
    action: string;
    target: string;
    eventName: (typeof domainEvents)[keyof typeof domainEvents];
    payload: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorId: input.actorId,
        action: input.action,
        target: input.target,
        metadata: input.payload as Prisma.InputJsonValue
      }
    });

    await this.outbox.enqueue(this.event(input.target, input.tenantId, input.eventName, input.payload));
  }

  private event(
    aggregateId: string,
    tenantId: string,
    name: (typeof domainEvents)[keyof typeof domainEvents],
    payload: Record<string, unknown>,
  ) {
    return {
      id: randomUUID(),
      name,
      tenantId,
      aggregateId,
      payload,
      occurredAt: new Date().toISOString()
    };
  }

  private toUserSummary(user: UserWithRoles) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      deletedAt: user.deletedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      roles: user.roles.map((userRole) => this.toUserRoleSummary(userRole))
    };
  }

  private toRoleSummary(role: RoleWithPermissions) {
    return {
      id: role.id,
      name: role.name,
      tenantId: role.tenantId,
      permissions: role.permissions.map((rolePermission) => rolePermission.permission.key)
    };
  }

  private toUserRoleSummary(userRole: UserRoleWithRoleTenant) {
    return {
      id: userRole.id,
      roleId: userRole.roleId,
      roleName: userRole.role.name,
      tenantId: userRole.tenantId,
      tenantName: userRole.tenant?.name ?? null,
      permissions: userRole.role.permissions.map((rolePermission) => rolePermission.permission.key)
    };
  }

  private toApprovalSummary(approval: ApprovalWithDetails) {
    return {
      id: approval.id,
      tenantId: approval.tenantId,
      targetUserId: approval.targetUserId,
      targetUserName: approval.targetUser.name,
      targetUserEmail: approval.targetUser.email,
      roleId: approval.roleId,
      roleName: approval.role.name,
      action: approval.action,
      status: approval.status,
      requestedByName: approval.requestedBy.name,
      reason: approval.reason,
      createdAt: approval.createdAt.toISOString()
    };
  }

  private isUniqueError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}

type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: typeof roleInclude;
}>;

type UserRoleWithRoleTenant = Prisma.UserRoleGetPayload<{
  include: {
    tenant: true;
    role: {
      include: typeof roleInclude;
    };
  };
}>;

type UserWithRoles = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

type ApprovalWithDetails = Prisma.RoleChangeApprovalGetPayload<{
  include: typeof approvalInclude;
}>;
