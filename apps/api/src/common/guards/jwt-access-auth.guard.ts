import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_ROUTE } from '../decorators/public.decorator.js';
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
      throw new UnauthorizedException('Authentication is required.');
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET')
      });
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        userType: payload.userType ?? 'admin',
        sessionId: payload.sessionId,
        tenantIds: payload.tenantIds,
        permissions: payload.permissions
      } satisfies AuthenticatedUser;
      return true;
    } catch {
      throw new UnauthorizedException('Authentication is required.');
    }
  }
}
