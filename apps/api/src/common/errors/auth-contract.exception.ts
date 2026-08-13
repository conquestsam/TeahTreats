import { ForbiddenException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { authErrorCodes, authErrorMessages, type AuthErrorCode } from '@snacks/shared';

export class ApiContractException extends HttpException {
  constructor(statusCode: HttpStatus, code: AuthErrorCode | string, message: string, details?: unknown) {
    super(
      {
        statusCode,
        code,
        message,
        error: message,
        ...(details === undefined ? {} : { details })
      },
      statusCode,
    );
  }
}

function body(statusCode: HttpStatus, code: AuthErrorCode) {
  const message = authErrorMessages[code];
  return { statusCode, code, message, error: message };
}

export const authExceptions = {
  invalidCredentials: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.invalidCredentials)),
  sessionExpired: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.sessionExpired)),
  refreshRequired: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.refreshRequired)),
  csrfRequired: () => new ForbiddenException(body(HttpStatus.FORBIDDEN, authErrorCodes.csrfRequired)),
  csrfInvalid: () => new ForbiddenException(body(HttpStatus.FORBIDDEN, authErrorCodes.csrfInvalid)),
  tenantRequired: () => new ForbiddenException(body(HttpStatus.FORBIDDEN, authErrorCodes.tenantRequired)),
  tenantInvalid: () => new ForbiddenException(body(HttpStatus.FORBIDDEN, authErrorCodes.tenantInvalid)),
  tenantForbidden: () => new ForbiddenException(body(HttpStatus.FORBIDDEN, authErrorCodes.tenantForbidden)),
  permissionDenied: () => new ForbiddenException(body(HttpStatus.FORBIDDEN, authErrorCodes.permissionDenied)),
  mfaRequired: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.mfaRequired)),
  mfaInvalid: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.mfaInvalid)),
  oauthUnavailable: () => new ApiContractException(
    HttpStatus.SERVICE_UNAVAILABLE,
    authErrorCodes.oauthUnavailable,
    authErrorMessages[authErrorCodes.oauthUnavailable],
  ),
  oauthInvalidState: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.oauthInvalidState)),
  oauthFailed: () => new UnauthorizedException(body(HttpStatus.UNAUTHORIZED, authErrorCodes.oauthFailed))
};
