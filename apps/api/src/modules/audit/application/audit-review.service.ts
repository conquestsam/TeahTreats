import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

const kindPrefixes: Record<string, string[]> = {
  auth: ['auth.', 'user.', 'customer.'],
  payment: ['payment.'],
  tenant: ['tenant.'],
  settings: ['settings.'],
  inventory: ['inventory.'],
  catalog: ['catalog.', 'product.', 'sku.'],
  iam: ['iam.', 'role.', 'user-role.']
};

@Injectable()
export class AuditReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantIdOrSlug: string, query: { kind?: string; action?: string }) {
    const tenantId = await this.resolveTenantId(tenantIdOrSlug);
    const actionFilter = this.actionFilter(query);
    const logs = await this.prisma.auditLog.findMany({
      where: {
        tenantId,
        ...actionFilter
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return logs.map((log) => ({
      id: log.id,
      tenantId: log.tenantId,
      actorId: log.actorId,
      action: log.action,
      target: log.target,
      metadata: this.redactMetadata(log.metadata),
      createdAt: log.createdAt.toISOString()
    }));
  }

  private actionFilter(query: { kind?: string; action?: string }): Prisma.AuditLogWhereInput {
    if (query.action) {
      return { action: query.action.trim() };
    }
    if (!query.kind || query.kind === 'all') {
      return {};
    }
    const prefixes = kindPrefixes[query.kind] ?? [];
    if (!prefixes.length) {
      return {};
    }
    return {
      OR: prefixes.map((prefix) => ({
        action: { startsWith: prefix }
      }))
    };
  }

  private redactMetadata(value: Prisma.JsonValue) {
    const metadata = value && typeof value === 'object' && !Array.isArray(value)
      ? { ...(value as Record<string, unknown>) }
      : {};
    for (const key of Object.keys(metadata)) {
      if (/token|secret|password|hash|signature/i.test(key)) {
        metadata[key] = '[redacted]';
      }
    }
    return metadata;
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new BadRequestException('Tenant was not found.');
    }
    return tenant.id;
  }
}
