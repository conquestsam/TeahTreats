import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';

interface VendorTenantAccessInput {
  actor: AuthenticatedUser;
  tenant: {
    id: string;
    active: boolean;
  } | null;
}

export class VendorAccessPolicy {
  static ensureTenantExists(tenant: VendorTenantAccessInput['tenant']) {
    if (!tenant) {
      throw new NotFoundException('Tenant was not found.');
    }
    return tenant;
  }

  static ensureAssignedActiveTenant({ actor, tenant }: VendorTenantAccessInput) {
    const resolvedTenant = this.ensureTenantExists(tenant);
    if (!actor.tenantIds.includes(resolvedTenant.id)) {
      throw new ForbiddenException('You do not have access to this vendor tenant.');
    }
    if (!resolvedTenant.active) {
      throw new ForbiddenException('This vendor tenant is inactive.');
    }
    return resolvedTenant.id;
  }
}
