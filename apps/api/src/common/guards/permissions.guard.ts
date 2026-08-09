import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS } from '../decorators/require-permissions.decorator.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const invalidPermissions = requiredPermissions.filter(
      (permission) => typeof permission !== 'string' || permission.trim().length === 0,
    );
    if (invalidPermissions.length > 0) {
      throw new InternalServerErrorException('Route permission metadata is invalid.');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userPermissions = new Set(request.user?.permissions ?? []);
    const missingPermissions = requiredPermissions.filter((permission) => !userPermissions.has(permission));

    if (missingPermissions.length > 0) {
      const message = process.env.NODE_ENV === 'production'
        ? 'You do not have permission for this action.'
        : `You do not have permission for this action. Missing: ${missingPermissions.join(', ')}.`;
      throw new ForbiddenException(message);
    }

    return true;
  }
}
