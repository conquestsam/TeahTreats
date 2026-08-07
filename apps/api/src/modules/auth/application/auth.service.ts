import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { domainEvents } from '@snacks/shared';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { UserType } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { OutboxService } from '../../outbox/application/outbox.service.js';
import type { LoginDto } from '../presentation/dto/login.dto.js';

interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

interface AccessClaims {
  sub: string;
  email: string;
  name: string;
  userType: 'admin' | 'customer';
  sessionId: string;
  tenantIds: string[];
  permissions: string[];
  mfaRequired?: boolean;
  mfaVerified?: boolean;
}

interface RefreshClaims {
  sub: string;
  sessionId: string;
}

type UserWithAccess = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
  ) {}

  async login(dto: LoginDto, context: RequestContext) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: this.userAccessInclude()
    });

    if (!user?.passwordHash || user.deletedAt || user.userType !== UserType.admin) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        expiresAt: this.refreshExpiresAt(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    const access = this.buildAccessClaims(user, session.id);
    const tokens = await this.issueTokens(access);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: await argon2.hash(tokens.refreshToken) }
    });

    void this.outbox.enqueue({
      id: randomUUID(),
      name: domainEvents.userLoggedIn,
      tenantId: access.tenantIds[0] ?? null,
      aggregateId: user.id,
      payload: {
        userId: user.id,
        sessionId: session.id,
        mfaRequired: access.mfaRequired ?? false
      },
      occurredAt: new Date().toISOString()
    });

    return {
      tokens,
      user: this.safeUser(access)
    };
  }

  async refresh(refreshToken: string | undefined, context: RequestContext) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh session is required.');
    }

    const claims = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { id: claims.sessionId },
      include: {
        user: {
          include: this.userAccessInclude()
        }
      }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    const matchesStoredToken = await argon2.verify(session.refreshTokenHash, refreshToken);
    if (!matchesStoredToken || session.user.deletedAt) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    const access = this.buildAccessClaims(session.user, session.id);
    const tokens = await this.issueTokens(access);
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await argon2.hash(tokens.refreshToken),
        expiresAt: this.refreshExpiresAt(),
        lastUsedAt: new Date(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return {
      tokens,
      user: this.safeUser(access)
    };
  }

  async logout(user: { id: string; sessionId: string }) {
    await this.prisma.session.updateMany({
      where: {
        id: user.sessionId,
        userId: user.id,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    void this.outbox.enqueue({
      id: randomUUID(),
      name: domainEvents.userLoggedOut,
      tenantId: null,
      aggregateId: user.id,
      payload: {
        userId: user.id,
        sessionId: user.sessionId
      },
      occurredAt: new Date().toISOString()
    });

    return { ok: true };
  }

  safeUser(user: AccessClaims) {
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      userType: user.userType,
      tenantIds: user.tenantIds,
      permissions: user.permissions,
      mfaRequired: user.mfaRequired ?? false,
      mfaVerified: user.mfaVerified ?? false
    };
  }

  private async issueTokens(access: AccessClaims) {
    const refreshClaims: RefreshClaims = {
      sub: access.sub,
      sessionId: access.sessionId
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(access, {
        secret: this.config.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET'),
        expiresIn: '15m'
      }),
      this.jwt.signAsync(refreshClaims, {
        secret: this.config.getOrThrow<string>('AUTH_REFRESH_TOKEN_SECRET'),
        expiresIn: '30d'
      })
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwt.verifyAsync<RefreshClaims>(refreshToken, {
        secret: this.config.getOrThrow<string>('AUTH_REFRESH_TOKEN_SECRET')
      });
    } catch {
      throw new UnauthorizedException('Refresh session is invalid.');
    }
  }

  private buildAccessClaims(user: UserWithAccess, sessionId: string): AccessClaims {
    const tenantIds = new Set<string>();
    const permissions = new Set<string>();

    for (const userRole of user.roles) {
      if (userRole.tenantId) {
        tenantIds.add(userRole.tenantId);
      }
      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.key);
      }
    }

    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      sessionId,
      tenantIds: [...tenantIds],
      permissions: [...permissions],
      mfaRequired: user.adminMfaEnabled,
      mfaVerified: !user.adminMfaEnabled
    };
  }

  private refreshExpiresAt() {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private userAccessInclude() {
    return {
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
    } as const;
  }
}
