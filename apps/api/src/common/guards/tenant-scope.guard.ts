import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { permissions } from '@snacks/shared';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { authExceptions } from '../errors/auth-contract.exception.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.js';

@Injectable()
export class TenantScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<
      AuthenticatedRequest & { headers: Record<string, string | string[] | undefined> }
    >();
    const tenantHeader = request.headers['x-tenant-id'];
    const tenantIdOrSlug = this.normalizeTenantHeader(tenantHeader);
    const tenantHeaderProvided = Array.isArray(tenantHeader) ? tenantHeader.length > 0 : tenantHeader !== undefined;
    const authenticatedTenantIds = request.user?.tenantIds ?? [];

    if (tenantHeaderProvided && !tenantIdOrSlug) {
      throw authExceptions.tenantInvalid();
    }

    if (!request.user) {
      if (!tenantIdOrSlug) {
        throw authExceptions.tenantRequired();
      }
      request.tenantId = await this.resolveTenantId(tenantIdOrSlug);
      return true;
    }

    if (tenantIdOrSlug === 'all') {
      if (!request.user.permissions.includes(permissions.tenantsManage)) {
        throw authExceptions.tenantForbidden();
      }
      request.tenantId = 'all';
      return true;
    }

    if (!tenantIdOrSlug) {
      const [firstTenantId] = authenticatedTenantIds;
      if (firstTenantId) {
        request.tenantId = firstTenantId;
        return true;
      }
      throw authExceptions.tenantRequired();
    }

    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    if (!authenticatedTenantIds.includes(tenantId)) {
      throw authExceptions.tenantForbidden();
    }

    request.tenantId = tenantId;
    return true;
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        active: true,
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }]
      },
      select: { id: true }
    });

    if (!tenant) {
      throw authExceptions.tenantInvalid();
    }

    return tenant.id;
  }

  private normalizeTenantHeader(value: string | string[] | undefined) {
    const tenant = Array.isArray(value) ? value[0] : value;
    const normalized = tenant?.trim();
    if (!normalized || normalized.length > 120 || !/^[a-zA-Z0-9_-]+$/.test(normalized)) {
      return undefined;
    }
    return normalized;
  }
}
