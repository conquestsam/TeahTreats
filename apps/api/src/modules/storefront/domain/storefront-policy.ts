import { BadRequestException, NotFoundException } from '@nestjs/common';

export class StorefrontPolicy {
  static ensureTenantContext(tenantId: string | undefined) {
    if (!tenantId) {
      throw new BadRequestException('Tenant scope is required.');
    }
  }

  static ensureFound<T>(value: T | null | undefined) {
    if (!value) {
      throw new NotFoundException('This snack is not available right now.');
    }
    return value;
  }
}
