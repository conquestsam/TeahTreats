import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

export class InventoryPolicy {
  static ensureTenantContext(tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required.');
    }
  }

  static ensureFound<TValue>(value: TValue | null | undefined, message = 'Inventory record was not found.') {
    if (!value) {
      throw new NotFoundException(message);
    }
    return value;
  }

  static ensureSkuCanReceiveStock(input: {
    active: boolean;
    productStatus: ProductStatus;
  }) {
    if (!input.active) {
      throw new BadRequestException('Inactive SKUs cannot receive stock.');
    }

    if (input.productStatus === ProductStatus.archived) {
      throw new BadRequestException('Archived products cannot receive stock.');
    }
  }

  static ensureExpiry(input: { isPerishable: boolean; expiresAt?: Date }) {
    if (input.isPerishable && !input.expiresAt) {
      throw new BadRequestException('Expiry date is required for perishable stock.');
    }

    if (input.expiresAt && input.expiresAt <= new Date()) {
      throw new BadRequestException('Expiry date must be in the future.');
    }
  }

  static ensureQuantityIsSafe(quantity: number, reserved: number) {
    if (quantity < reserved) {
      throw new BadRequestException('Quantity cannot be lower than reserved stock.');
    }
  }

  static ensureAdjustmentIsAllowed(input: {
    delta: number;
    quantity: number;
    reserved: number;
    expiredAt?: Date | null;
    expiresAt?: Date | null;
  }) {
    if (input.delta === 0) {
      throw new BadRequestException('Adjustment amount cannot be zero.');
    }

    const isExpired = Boolean(input.expiredAt) || Boolean(input.expiresAt && input.expiresAt <= new Date());
    if (isExpired && input.delta > 0) {
      throw new BadRequestException('Expired batches cannot receive positive sellable adjustments.');
    }

    InventoryPolicy.ensureQuantityIsSafe(input.quantity + input.delta, input.reserved);
  }
}
