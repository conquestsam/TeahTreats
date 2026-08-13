export const authErrorCodes = {
  invalidCredentials: 'AUTH_INVALID_CREDENTIALS',
  sessionExpired: 'AUTH_SESSION_EXPIRED',
  refreshRequired: 'AUTH_REFRESH_REQUIRED',
  csrfRequired: 'AUTH_CSRF_REQUIRED',
  csrfInvalid: 'AUTH_CSRF_INVALID',
  tenantRequired: 'AUTH_TENANT_REQUIRED',
  tenantInvalid: 'AUTH_TENANT_INVALID',
  tenantForbidden: 'AUTH_TENANT_FORBIDDEN',
  permissionDenied: 'AUTH_PERMISSION_DENIED',
  mfaRequired: 'AUTH_MFA_REQUIRED',
  mfaInvalid: 'AUTH_MFA_INVALID',
  oauthUnavailable: 'AUTH_OAUTH_UNAVAILABLE',
  oauthInvalidState: 'AUTH_OAUTH_INVALID_STATE',
  oauthFailed: 'AUTH_OAUTH_FAILED'
} as const;

export type AuthErrorCode = (typeof authErrorCodes)[keyof typeof authErrorCodes];

export const authErrorMessages = {
  [authErrorCodes.invalidCredentials]: 'Email or password is incorrect.',
  [authErrorCodes.sessionExpired]: 'Your session has expired. Please sign in again.',
  [authErrorCodes.refreshRequired]: 'Refresh session is required.',
  [authErrorCodes.csrfRequired]: 'Security token is required. Refresh the page and try again.',
  [authErrorCodes.csrfInvalid]: 'Security token is invalid. Refresh the page and try again.',
  [authErrorCodes.tenantRequired]: 'Choose a store before continuing.',
  [authErrorCodes.tenantInvalid]: 'You do not have access to this store.',
  [authErrorCodes.tenantForbidden]: 'You do not have access to this store.',
  [authErrorCodes.permissionDenied]: 'You do not have permission for this action.',
  [authErrorCodes.mfaRequired]: 'MFA verification is required.',
  [authErrorCodes.mfaInvalid]: 'MFA code is incorrect.',
  [authErrorCodes.oauthUnavailable]: 'This sign-in option is not available right now.',
  [authErrorCodes.oauthInvalidState]: 'This sign-in request has expired. Please try again.',
  [authErrorCodes.oauthFailed]: 'Could not complete sign in. Please try again.'
} as const satisfies Record<AuthErrorCode, string>;

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  error: string;
  details?: unknown;
}
