import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { PermissionsGuard } from '../src/common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../src/common/guards/tenant-scope.guard.js';
import { CartPolicy } from '../src/modules/cart/domain/cart-policy.js';
import { ProductPolicy } from '../src/modules/catalog/domain/product-policy.js';
import { CheckoutPolicy } from '../src/modules/checkout/domain/checkout-policy.js';
import { InventoryPolicy } from '../src/modules/inventory/domain/inventory-policy.js';
import { OrderPolicy } from '../src/modules/orders/domain/order-policy.js';
import { PaymentPolicy } from '../src/modules/payments/domain/payment-policy.js';
import { StorefrontPolicy } from '../src/modules/storefront/domain/storefront-policy.js';
import { VendorAccessPolicy } from '../src/modules/vendor/domain/vendor-access-policy.js';

function context(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as never;
}

function throwsException(fn: () => unknown, expected: new (...args: never[]) => Error) {
  assert.throws(fn, (error) => error instanceof expected);
}

test('tenant scope guard resolves public tenant headers and rejects malformed tenant context', async () => {
  const guard = new TenantScopeGuard({
    tenant: {
      findFirst: async ({ where }: { where: { OR: Array<{ id?: string; slug?: string }> } }) =>
        where.OR.some((item) => item.slug === 'platform' || item.id === 'tenant-1')
          ? { id: 'tenant-1' }
          : null,
    },
  } as never);

  const request = { headers: { 'x-tenant-id': 'platform' } };
  assert.equal(await guard.canActivate(context(request)), true);
  assert.equal(request.tenantId, 'tenant-1');

  await assert.rejects(
    () => guard.canActivate(context({ headers: { 'x-tenant-id': '../bad' } })),
    ForbiddenException,
  );
});

test('tenant scope guard prevents cross-tenant authenticated access', async () => {
  const guard = new TenantScopeGuard({
    tenant: {
      findFirst: async () => ({ id: 'tenant-2' }),
    },
  } as never);

  await assert.rejects(
    () =>
      guard.canActivate(
        context({
          headers: { 'x-tenant-id': 'tenant-2' },
          user: { tenantIds: ['tenant-1'] },
        }),
      ),
    ForbiddenException,
  );
});

test('permissions guard requires every declared permission', () => {
  const reflector = {
    getAllAndOverride: () => ['products:read', 'products:write'],
  };
  const guard = new PermissionsGuard(reflector as never);

  assert.equal(
    guard.canActivate(context({ user: { permissions: ['products:read', 'products:write'] } })),
    true,
  );
  throwsException(
    () => guard.canActivate(context({ user: { permissions: ['products:read'] } })),
    ForbiddenException,
  );
});

test('product policy protects archived products and activation requirements', () => {
  throwsException(
    () => ProductPolicy.ensureEditable({ id: 'p1', tenantId: 't1', status: 'archived' }),
    ConflictException,
  );
});

test('product activation requires an active SKU and perishable guidance', () => {
  throwsException(
    () => ProductPolicy.ensureCanActivate({ id: 'p1', tenantId: 't1', status: 'draft', skus: [] }),
    BadRequestException,
  );
  throwsException(
    () =>
      ProductPolicy.ensureCanActivate({
        id: 'p1',
        tenantId: 't1',
        status: 'draft',
        skus: [{ active: true }],
        metadata: { isPerishable: true },
      }),
    BadRequestException,
  );
  assert.doesNotThrow(() =>
    ProductPolicy.ensureCanActivate({
      id: 'p1',
      tenantId: 't1',
      status: 'draft',
      skus: [{ active: true }],
      metadata: { isPerishable: true, storageInstructions: 'Keep chilled.' },
    }),
  );
});

test('cart and checkout policies block inactive or unavailable SKU flows', () => {
  throwsException(
    () => CartPolicy.ensureSkuSellable({ active: false, productStatus: ProductStatus.active }),
    BadRequestException,
  );
  throwsException(
    () =>
      CheckoutPolicy.ensureCartReady({
        items: [
          {
            quantity: 1,
            sku: { active: true, product: { status: ProductStatus.archived, name: 'Old snack' } },
          },
        ],
      } as never),
    BadRequestException,
  );
});

test('inventory policy enforces perishable expiry and reserved stock safety', () => {
  throwsException(() => InventoryPolicy.ensureExpiry({ isPerishable: true }), BadRequestException);
  throwsException(() => InventoryPolicy.ensureQuantityIsSafe(2, 3), BadRequestException);
  throwsException(
    () =>
      InventoryPolicy.ensureAdjustmentIsAllowed({
        delta: 1,
        quantity: 5,
        reserved: 0,
        expiredAt: new Date(),
      }),
    BadRequestException,
  );
});

test('order lifecycle policy enforces valid status transitions', () => {
  assert.doesNotThrow(() => OrderPolicy.ensureCanMarkPreparing(OrderStatus.paid));
  throwsException(
    () => OrderPolicy.ensureCanMarkPreparing(OrderStatus.payment_pending),
    BadRequestException,
  );
  assert.doesNotThrow(() => OrderPolicy.ensureCanMarkReady(OrderStatus.preparing));
  throwsException(
    () => OrderPolicy.ensureCanMarkCompleted(OrderStatus.preparing),
    BadRequestException,
  );
  throwsException(() => OrderPolicy.ensureCanCancel(OrderStatus.completed), BadRequestException);
});

test('customer order privacy verification rejects mismatched customer details', () => {
  throwsException(
    () =>
      OrderPolicy.ensureCustomerMatches(
        { email: 'one@example.com', phone: '5551112222' },
        { email: 'two@example.com', phone: '5551112222' },
      ),
    BadRequestException,
  );
  assert.doesNotThrow(() =>
    OrderPolicy.ensureCustomerMatches(
      { email: 'customer@example.com', phone: '5551112222' },
      { email: 'customer@example.com', phone: '5551112222' },
    ),
  );
});

test('payment policy blocks expired, paid, or mismatched payment attempts', () => {
  throwsException(
    () =>
      PaymentPolicy.ensureCustomerMatches(
        { email: 'buyer@example.com', phone: '5551112222' },
        { email: 'other@example.com', phone: '5551112222' },
      ),
    ForbiddenException,
  );
  throwsException(
    () =>
      PaymentPolicy.ensurePayable({
        status: OrderStatus.payment_pending,
        reservationExpiresAt: new Date(Date.now() - 1000),
        payments: [],
      }),
    BadRequestException,
  );
  throwsException(
    () =>
      PaymentPolicy.ensurePayable({
        status: OrderStatus.payment_pending,
        reservationExpiresAt: new Date(Date.now() + 1000),
        payments: [{ status: PaymentStatus.paid }],
      }),
    BadRequestException,
  );
});

test('vendor access policy enforces assigned active tenant isolation', () => {
  throwsException(
    () =>
      VendorAccessPolicy.ensureAssignedActiveTenant({
        actor: { tenantIds: ['tenant-1'] } as never,
        tenant: { id: 'tenant-2', active: true },
      }),
    ForbiddenException,
  );
  throwsException(
    () =>
      VendorAccessPolicy.ensureAssignedActiveTenant({
        actor: { tenantIds: ['tenant-1'] } as never,
        tenant: { id: 'tenant-1', active: false },
      }),
    ForbiddenException,
  );
  assert.equal(
    VendorAccessPolicy.ensureAssignedActiveTenant({
      actor: { tenantIds: ['tenant-1'] } as never,
      tenant: { id: 'tenant-1', active: true },
    }),
    'tenant-1',
  );
});

test('storefront policy hides unavailable products', () => {
  throwsException(() => StorefrontPolicy.ensureFound(null), NotFoundException);
  assert.equal(StorefrontPolicy.ensureFound({ id: 'p1' }).id, 'p1');
});
