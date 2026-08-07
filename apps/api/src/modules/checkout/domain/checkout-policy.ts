import { BadRequestException } from '@nestjs/common';
import type { CartWithItems } from '../../cart/application/cart.service.js';
import { ProductStatus } from '@prisma/client';

export class CheckoutPolicy {
  static ensureCartReady(cart: CartWithItems) {
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    for (const item of cart.items) {
      if (!item.sku.active || item.sku.product.status !== ProductStatus.active) {
        throw new BadRequestException(`${item.sku.product.name} is not available.`);
      }
      if (item.quantity < 1) {
        throw new BadRequestException('Cart item quantity must be at least 1.');
      }
    }
  }
}
