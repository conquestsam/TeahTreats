const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
export const temporaryTenantId = process.env.NEXT_PUBLIC_TEMP_TENANT_ID;

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function apiFetch<TResponse>(
  path: string,
  init?: RequestInit & { skipAuthRefresh?: boolean },
): Promise<TResponse> {
  const method = init?.method?.toUpperCase() ?? 'GET';
  const headers = new Headers(init?.headers);
  const hasBody = init?.body !== undefined;

  if (hasBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  if (temporaryTenantId && !headers.has('x-tenant-id')) {
    headers.set('x-tenant-id', temporaryTenantId);
  }

  const csrfToken = readCookie('csrf_token');
  if (csrfToken && unsafeMethods.has(method) && !headers.has('x-csrf-token')) {
    headers.set('x-csrf-token', csrfToken);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers
    });
  } catch {
    throw new ApiError(
      `The API server is offline or unreachable at ${apiBaseUrl}. Start the backend with pnpm dev:api, then try again.`,
      0,
    );
  }

  if (response.status === 401 && !init?.skipAuthRefresh && path !== '/auth/refresh') {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<TResponse>(path, { ...init, skipAuthRefresh: true });
    }
  }

  if (!response.ok) {
    throw new ApiError(await resolveErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

function readCookie(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return value ? decodeURIComponent(value) : null;
}

async function refreshSession() {
  try {
    await apiFetch('/auth/refresh', {
      method: 'POST',
      skipAuthRefresh: true
    });
    return true;
  } catch {
    return false;
  }
}

async function resolveErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };
    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }
    if (response.status === 401) {
      return 'Your session expired. Please sign in again.';
    }
    if (response.status === 403 && typeof body.message === 'string' && body.message.toLowerCase().includes('csrf')) {
      return 'Your security token expired. Refresh the page and try again.';
    }
    if (
      (response.status === 400 || response.status === 403) &&
      typeof body.message === 'string' &&
      body.message.toLowerCase().includes('tenant')
    ) {
      return 'Tenant is missing. Set NEXT_PUBLIC_TEMP_TENANT_ID=platform or send x-tenant-id.';
    }
    if (response.status === 429) {
      return 'Too many attempts. Please wait and try again.';
    }
    return body.message ?? body.error ?? `Request failed: ${response.statusText}`;
  } catch {
    return `Request failed: ${response.statusText}`;
  }
}
