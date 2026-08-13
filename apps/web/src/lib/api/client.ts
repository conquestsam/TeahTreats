import type { ApiErrorBody } from '@snacks/shared';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
export const temporaryTenantId = process.env.NEXT_PUBLIC_TEMP_TENANT_ID;

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = 'REQUEST_FAILED',
    readonly details?: unknown,
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
      'API server is offline or unreachable.',
      0,
      'API_OFFLINE',
    );
  }

  if (shouldAttemptRefresh(path, response.status, init?.skipAuthRefresh)) {
    const refreshed = await refreshSession(path, headers);
    if (refreshed) {
      return apiFetch<TResponse>(path, { ...init, skipAuthRefresh: true });
    }
  }

  if (!response.ok) {
    const errorBody = await resolveErrorBody(response);
    throw new ApiError(errorBody.message, response.status, errorBody.code, errorBody.details);
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

async function refreshSession(path: string, headers: Headers) {
  try {
    const refreshPath = shouldUseCustomerRefresh(path) ? '/customer-auth/refresh' : '/auth/refresh';
    await apiFetch(refreshPath, {
      method: 'POST',
      headers,
      skipAuthRefresh: true
    });
    return true;
  } catch {
    return false;
  }
}

function shouldAttemptRefresh(path: string, status: number, skipAuthRefresh: boolean | undefined) {
  if (skipAuthRefresh || status !== 401) {
    return false;
  }
  if (path.endsWith('/refresh') || path.endsWith('/login') || path.endsWith('/signup') || path.endsWith('/csrf')) {
    return false;
  }
  return path.startsWith('/auth') || path.startsWith('/admin') || path.startsWith('/customer-auth') || path.startsWith('/shop/orders');
}

function shouldUseCustomerRefresh(path: string) {
  return path.startsWith('/customer-auth') || path.startsWith('/shop/orders');
}

async function resolveErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody> & { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return {
        statusCode: response.status,
        code: body.code ?? 'VALIDATION_ERROR',
        message: body.message.join(' '),
        error: body.error ?? 'Validation failed.',
        details: body.details
      };
    }
    const message = body.message ?? body.error ?? `Request failed: ${response.statusText}`;
    return {
      statusCode: body.statusCode ?? response.status,
      code: body.code ?? fallbackCode(response.status),
      message,
      error: body.error ?? message,
      details: body.details
    };
  } catch {
    const message = `Request failed: ${response.statusText}`;
    return {
      statusCode: response.status,
      code: fallbackCode(response.status),
      message,
      error: message
    };
  }
}

function fallbackCode(status: number) {
  if (status === 401) {
    return 'AUTH_SESSION_EXPIRED';
  }
  if (status === 403) {
    return 'AUTH_PERMISSION_DENIED';
  }
  if (status === 429) {
    return 'RATE_LIMITED';
  }
  return 'REQUEST_FAILED';
}
