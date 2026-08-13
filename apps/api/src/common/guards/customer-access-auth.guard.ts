import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { authExceptions } from '../errors/auth-contract.exception.js';
import type { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-request.js';

interface CustomerAccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  userType: 'customer';
  sessionId: string;
  tenantIds: string[];
  permissions: string[];
}

@Injectable()
export class CustomerAccessAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<
      AuthenticatedRequest & { cookies?: Record<string, string | undefined> }
    >();
    const token = request.cookies?.customer_access_token;
    if (!token) {
      throw authExceptions.sessionExpired();
    }

    try {
      const payload = await this.jwt.verifyAsync<CustomerAccessTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET')
      });
      if (payload.userType !== 'customer') {
        throw authExceptions.sessionExpired();
      }
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true }
      });
      if (
        !session ||
        session.revokedAt ||
        session.expiresAt <= new Date() ||
        session.user.deletedAt ||
        session.user.userType !== 'customer'
      ) {
        throw authExceptions.sessionExpired();
      }
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        userType: payload.userType,
        sessionId: payload.sessionId,
        tenantIds: payload.tenantIds,
        permissions: payload.permissions
      } satisfies AuthenticatedUser;
      return true;
    } catch {
      throw authExceptions.sessionExpired();
    }
  }
}
