import { authErrorCodes } from '@snacks/shared';
import { ApiError } from '@/lib/api/client';

export function isAuthSessionError(error: unknown) {
  return error instanceof ApiError && (
    error.code === authErrorCodes.sessionExpired ||
    error.code === authErrorCodes.refreshRequired ||
    error.status === 401
  );
}

export function isPermissionError(error: unknown) {
  return error instanceof ApiError && (
    error.code === authErrorCodes.permissionDenied ||
    error.code === authErrorCodes.tenantForbidden ||
    error.code === authErrorCodes.tenantRequired ||
    error.code === authErrorCodes.tenantInvalid ||
    error.status === 403
  );
}

export function redirectOnce(path: string) {
  if (typeof window === 'undefined') {
    return;
  }
  const target = new URL(path, window.location.origin);
  if (window.location.pathname === target.pathname) {
    return;
  }
  window.location.replace(target.toString());
}
