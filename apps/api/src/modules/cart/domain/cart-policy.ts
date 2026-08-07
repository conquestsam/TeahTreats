import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

export class CartPolicy {
  static ensureTenantContext(tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required.');
    }
  }

  static ensureFound<TValue>(value: TValue | null | undefined, message = 'Cart record was not found.') {
    if (!value) {
      throw new NotFoundException(message);
    }
    return value;
  }

  static ensureSkuSellable(input: { active: boolean; productStatus: ProductStatus }) {
    if (!input.active || input.productStatus !== ProductStatus.active) {
      throw new BadRequestException('This item is not available.');
    }
  }
}
