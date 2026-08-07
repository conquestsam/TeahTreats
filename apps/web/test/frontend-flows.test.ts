import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdminProductName,
  validateAdminProductSlug,
} from '../src/validation/AdminProduct/adminProductValidation.ts';
import {
  checkoutCustomerSchema,
  validateWithSchema,
} from '../src/validation/CustomerCart/customerCartValidation.ts';
import {
  storefrontAddToCartSchema,
  storefrontSearchSchema,
  zodToMantineErrors,
} from '../src/validation/Storefront/storefrontValidation.ts';
import { apiFetch, ApiError } from '../src/lib/api/client.ts';

test('admin product flow validation accepts practical names and rejects bad slugs', () => {
  assert.equal(validateAdminProductName('Meat Pie'), null);
  assert.equal(validateAdminProductName('x'), 'Use 2 to 120 characters.');
  assert.equal(validateAdminProductSlug('fresh-meat-pie'), null);
  assert.equal(
    validateAdminProductSlug('Fresh Meat Pie'),
    'Use lowercase words separated by hyphens.',
  );
});

test('cart checkout identity flow requires usable customer details', () => {
  const errors = validateWithSchema(checkoutCustomerSchema, {
    name: '',
    email: 'bad-email',
    phone: '',
    address: '',
  });

  assert.equal(errors.name, 'Name is required.');
  assert.equal(errors.email, 'Enter a valid email.');
  assert.equal(errors.phone, 'Phone is required.');
  assert.equal(errors.address, 'Address is required.');
});

test('storefront search and add-to-cart validation keep requests safe', () => {
  assert.equal(storefrontSearchSchema.safeParse({ q: 'chips' }).success, true);
  assert.equal(storefrontSearchSchema.safeParse({ q: 'x'.repeat(81) }).success, false);

  const addToCartErrors = zodToMantineErrors(storefrontAddToCartSchema)({
    skuId: 'not-a-uuid',
    quantity: 0,
  });
  assert.equal(addToCartErrors.skuId, 'Choose a snack option.');
  assert.equal(addToCartErrors.quantity, 'Quantity must be at least 1.');
});

test('apiFetch adds JSON, CSRF, tenant header, credentials, and parses response envelopes', async () => {
  const originalFetch = globalThis.fetch;
  const originalDocument = globalThis.document;
  const calls: Array<{ url: string; init: RequestInit }> = [];

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { cookie: 'csrf_token=csrf-123' },
  });
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  const result = await apiFetch<{ data: { ok: true } }>('/shop/cart/items', {
    method: 'POST',
    body: JSON.stringify({ skuId: 'sku-1', quantity: 1 }),
  });

  const headers = calls[0]?.init.headers as Headers;
  assert.deepEqual(result, { data: { ok: true } });
  assert.equal(calls[0]?.url, 'http://localhost:4000/api/v1/shop/cart/items');
  assert.equal(calls[0]?.init.credentials, 'include');
  assert.equal(headers.get('content-type'), 'application/json');
  assert.equal(headers.get('x-csrf-token'), 'csrf-123');

  globalThis.fetch = originalFetch;
  Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
});

test('apiFetch converts network failure and auth errors into user-safe messages', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error('ECONNREFUSED');
  }) as typeof fetch;

  await assert.rejects(
    () => apiFetch('/health'),
    (error) => {
      assert.equal(error instanceof ApiError, true);
      assert.match((error as Error).message, /API server is offline/);
      return true;
    },
  );

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;

  await assert.rejects(
    () => apiFetch('/account/orders', { skipAuthRefresh: true }),
    (error) => {
      assert.equal(error instanceof ApiError, true);
      assert.equal((error as Error).message, 'Your session expired. Please sign in again.');
      return true;
    },
  );

  globalThis.fetch = originalFetch;
});
