import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

type ApiEndpointOptions = {
  summary: string;
  description?: string;
  status?: number;
  auth?: 'admin' | 'customer' | 'optional' | 'none';
  tenant?: 'required' | 'optional' | 'none';
  csrf?: boolean;
  okDescription?: string;
};

export function ApiEndpoint(options: ApiEndpointOptions) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      ...(options.description ? { description: options.description } : {})
    }),
    ApiResponse({
      status: options.status ?? 200,
      description: options.okDescription ?? 'Request completed successfully.'
    }),
    ApiBadRequestResponse({
      description: 'The request was invalid or failed DTO validation.'
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is missing, expired, or invalid.'
    }),
    ApiForbiddenResponse({
      description: 'The authenticated actor does not have permission or tenant access.'
    }),
    ApiNotFoundResponse({
      description: 'The requested resource was not found in the current tenant scope.'
    }),
    ApiConflictResponse({
      description: 'The requested change conflicts with an existing resource or business rule.'
    }),
    ApiTooManyRequestsResponse({
      description: 'The request was rate limited.'
    }),
    ApiInternalServerErrorResponse({
      description: 'An unexpected server error occurred.'
    })
  ];

  if (options.auth === 'admin') {
    decorators.push(ApiCookieAuth('access_token'));
  }

  if (options.auth === 'customer') {
    decorators.push(ApiCookieAuth('customer_access_token'));
  }

  if (options.tenant === 'required') {
    decorators.push(ApiHeader({
      name: 'x-tenant-id',
      required: true,
      description: 'Tenant context. Tenant IDs in request bodies are ignored.'
    }));
  }

  if (options.tenant === 'optional') {
    decorators.push(ApiHeader({
      name: 'x-tenant-id',
      required: false,
      description: 'Tenant context. Optional for super-admin routes that can infer tenant access.'
    }));
  }

  if (options.csrf) {
    decorators.push(ApiHeader({
      name: 'x-csrf-token',
      required: true,
      description: 'Required for unsafe browser mutations protected by the CSRF guard.'
    }));
  }

  return applyDecorators(...decorators);
}

export function ApiPublicEndpoint(summary: string, description?: string) {
  return ApiEndpoint({
    summary,
    ...(description ? { description } : {}),
    auth: 'none',
    tenant: 'none'
  });
}

export function ApiAdminEndpoint(summary: string, options: Omit<ApiEndpointOptions, 'summary' | 'auth'> = {}) {
  return ApiEndpoint({ ...options, summary, auth: 'admin' });
}

export function ApiCustomerEndpoint(summary: string, options: Omit<ApiEndpointOptions, 'summary' | 'auth'> = {}) {
  return ApiEndpoint({ ...options, summary, auth: 'customer' });
}
