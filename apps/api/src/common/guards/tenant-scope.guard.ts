import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
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
      throw new ForbiddenException('Tenant context is invalid.');
    }

    if (!request.user) {
      if (!tenantIdOrSlug) {
        throw new ForbiddenException('Tenant context is required.');
      }
      request.tenantId = await this.resolveTenantId(tenantIdOrSlug);
      return true;
    }

    if (!tenantIdOrSlug) {
      const [firstTenantId] = authenticatedTenantIds;
      if (firstTenantId) {
        request.tenantId = firstTenantId;
        return true;
      }
      throw new ForbiddenException('Tenant context is required.');
    }

    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    if (!authenticatedTenantIds.includes(tenantId)) {
      throw new ForbiddenException('You do not have access to this tenant.');
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
      throw new ForbiddenException('Tenant context is invalid.');
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
