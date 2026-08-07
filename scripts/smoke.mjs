const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const tenantId = process.env.NEXT_PUBLIC_TEMP_TENANT_ID ?? 'platform';

const checks = {
  async health() {
    return request('/health');
  },
  async storefront() {
    return request('/shop/storefront/products?page=1&pageSize=4&sort=newest', {
      headers: { 'x-tenant-id': tenantId }
    });
  },
  async 'admin-login'() {
    return request('/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId
      },
      body: JSON.stringify({
        email: 'admin@snacks.local',
        password: 'Password#23'
      })
    });
  },
  async 'customer-auth'() {
    const csrf = await request('/customer-auth/csrf', {
      headers: { 'x-tenant-id': tenantId },
      includeHeaders: true
    });
    const cookie = csrf.headers.get('set-cookie') ?? '';
    const csrfToken = cookie.match(/csrf_token=([^;]+)/)?.[1] ?? '';

    return request('/customer-auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
        'x-csrf-token': decodeURIComponent(csrfToken),
        cookie
      },
      body: JSON.stringify({
        email: 'customer@snacks.local',
        password: 'Password#23'
      })
    });
  }
};

const target = process.argv[2] ?? 'all';

if (target === 'all') {
  for (const name of Object.keys(checks)) {
    await run(name);
  }
} else if (checks[target]) {
  await run(target);
} else {
  console.error(`Unknown smoke check "${target}".`);
  process.exit(1);
}

async function run(name) {
  try {
    const result = await checks[name]();
    console.log(`✅ ${name}: ${result.status} ${result.statusText}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

async function request(path, init = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, init);
  } catch {
    throw new Error(`API is unreachable at ${apiBaseUrl}. Start it with pnpm dev:api.`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText} ${text.slice(0, 500)}`);
  }

  if (init.includeHeaders) {
    return response;
  }
  await response.text();
  return response;
}
