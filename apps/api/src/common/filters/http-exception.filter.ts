import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    response.status(statusCode).json(this.normalize(statusCode, exceptionResponse));
  }

  private normalize(statusCode: number, value: unknown) {
    if (typeof value === 'object' && value !== null) {
      const body = value as {
        code?: string;
        message?: string | string[];
        error?: string;
        details?: unknown;
      };
      const message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message ?? body.error ?? this.defaultMessage(statusCode);
      return {
        statusCode,
        code: body.code ?? this.defaultCode(statusCode),
        message,
        error: body.error ?? message,
        ...(body.details === undefined ? {} : { details: body.details })
      };
    }

    const message = typeof value === 'string' ? value : this.defaultMessage(statusCode);
    return {
      statusCode,
      code: this.defaultCode(statusCode),
      message,
      error: message
    };
  }

  private defaultCode(statusCode: number) {
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'VALIDATION_ERROR';
    }
    if (statusCode === HttpStatus.UNAUTHORIZED) {
      return 'AUTH_SESSION_EXPIRED';
    }
    if (statusCode === HttpStatus.FORBIDDEN) {
      return 'AUTH_PERMISSION_DENIED';
    }
    if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
      return 'RATE_LIMITED';
    }
    return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
  }

  private defaultMessage(statusCode: number) {
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'Request validation failed.';
    }
    if (statusCode === HttpStatus.UNAUTHORIZED) {
      return 'Your session has expired. Please sign in again.';
    }
    if (statusCode === HttpStatus.FORBIDDEN) {
      return 'You do not have permission for this action.';
    }
    if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
      return 'Too many attempts. Please wait and try again.';
    }
    return statusCode >= 500 ? 'Something went wrong.' : 'Request failed.';
  }
}
