import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_ROUTE } from '../decorators/public.decorator.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { authExceptions } from '../errors/auth-contract.exception.js';
import type { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-request.js';

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  userType?: 'admin' | 'customer';
  sessionId: string;
  tenantIds: string[];
  permissions: string[];
}

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      AuthenticatedRequest & { cookies?: Record<string, string | undefined> }
    >();
    const token = request.cookies?.access_token;

    if (!token) {
      throw authExceptions.sessionExpired();
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET')
      });
      request.user = await this.hydrateCurrentAccess(payload);
      return true;
    } catch {
      throw authExceptions.sessionExpired();
    }
  }

  private async hydrateCurrentAccess(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.deletedAt) {
      throw authExceptions.sessionExpired();
    }

    const tenantIds = new Set<string>();
    const permissions = new Set<string>();
    for (const userRole of session.user.roles) {
      if (userRole.tenantId) {
        tenantIds.add(userRole.tenantId);
      }
      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.key);
      }
    }

    return {
        id: payload.sub,
        email: session.user.email,
        name: session.user.name,
        userType: session.user.userType,
        sessionId: payload.sessionId,
        tenantIds: [...tenantIds],
        permissions: [...permissions],
        mfaRequired: session.user.adminMfaEnabled,
        mfaVerified: !session.user.adminMfaEnabled
      };
  }
}
