import test from 'node:test';
import assert from 'node:assert/strict';
import { permissions } from '../src/permissions/index.ts';
import { domainEvents } from '../src/events/index.ts';

test('shared permissions expose production-critical gates', () => {
  assert.equal(permissions.productsWrite, 'products:write');
  assert.equal(permissions.inventoryWrite, 'inventory:write');
  assert.equal(permissions.ordersWrite, 'orders:write');
  assert.equal(permissions.tenantsManage, 'tenants:manage');
  assert.equal(permissions.auditRead, 'audit:read');
});

test('shared domain events include outbox-critical commerce events', () => {
  assert.equal(domainEvents.productChanged, 'catalog.product-changed');
  assert.equal(domainEvents.orderCreated, 'order.created');
  assert.equal(domainEvents.paymentSucceeded, 'payment.succeeded');
  assert.equal(domainEvents.orderReadyForPickup, 'order.ready-for-pickup');
});
