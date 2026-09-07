import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { domainEvents } from '@snacks/shared';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { UserType } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { authExceptions } from '../../../common/errors/auth-contract.exception.js';
import { defaultAccessTokenTtl, defaultRefreshTokenTtl, durationToMs, durationToSeconds } from '../../../common/auth/token-lifetime.js';
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
      throw authExceptions.invalidCredentials();
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatches) {
      throw authExceptions.invalidCredentials();
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
      throw authExceptions.refreshRequired();
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

    if (!session) {
      await this.revokeSessionFamily(claims.sub);
      throw authExceptions.sessionExpired();
    }

    if (session.revokedAt) {
      await this.revokeSessionFamily(session.userId);
      throw authExceptions.sessionExpired();
    }

    if (session.expiresAt <= new Date()) {
      throw authExceptions.sessionExpired();
    }

    const matchesStoredToken = await argon2.verify(session.refreshTokenHash, refreshToken);
    if (!matchesStoredToken) {
      await this.revokeSessionFamily(session.userId);
      throw authExceptions.sessionExpired();
    }

    if (session.user.deletedAt) {
      await this.revokeSessionFamily(session.userId);
      throw authExceptions.sessionExpired();
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

  async logoutBySessionCookies(tokens: { accessToken: string | undefined; refreshToken: string | undefined }) {
    const accessClaims = await this.tryVerifyAccessToken(tokens.accessToken);
    const refreshClaims = await this.tryVerifyRefreshToken(tokens.refreshToken);
    const userId = accessClaims?.sub ?? refreshClaims?.sub;
    const sessionId = accessClaims?.sessionId ?? refreshClaims?.sessionId;

    if (!userId || !sessionId) {
      return { ok: true as const, revoked: false };
    }

    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    if (result.count > 0) {
      void this.outbox.enqueue({
        id: randomUUID(),
        name: domainEvents.userLoggedOut,
        tenantId: accessClaims?.tenantIds[0] ?? null,
        aggregateId: userId,
        payload: {
          userId,
          sessionId,
          reason: 'logout-cookie-fallback'
        },
        occurredAt: new Date().toISOString()
      });
    }

    return { ok: true as const, revoked: result.count > 0 };
  }

  async changePassword(userId: string, sessionId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.passwordHash || user.deletedAt || user.userType !== UserType.admin) {
      throw authExceptions.invalidCredentials();
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!passwordMatches) {
      throw authExceptions.invalidCredentials();
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      const revoked = await tx.session.updateMany({
        where: {
          userId: user.id,
          id: { not: sessionId },
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });

      return revoked;
    });

    void this.outbox.enqueue({
      id: randomUUID(),
      name: domainEvents.adminUserUpdated,
      tenantId: null,
      aggregateId: user.id,
      payload: {
        userId: user.id,
        reason: 'password-change',
        otherSessionsRevoked: result.count
      },
      occurredAt: new Date().toISOString()
    });

    return { ok: true as const, otherSessionsRevoked: result.count };
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
        expiresIn: durationToSeconds(this.config.get<string>('AUTH_ACCESS_TOKEN_TTL') ?? defaultAccessTokenTtl)
      }),
      this.jwt.signAsync(refreshClaims, {
        secret: this.config.getOrThrow<string>('AUTH_REFRESH_TOKEN_SECRET'),
        expiresIn: durationToSeconds(this.config.get<string>('AUTH_REFRESH_TOKEN_TTL') ?? defaultRefreshTokenTtl)
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
      throw authExceptions.sessionExpired();
    }
  }

  private async tryVerifyAccessToken(accessToken: string | undefined) {
    if (!accessToken) {
      return null;
    }
    try {
      return await this.jwt.verifyAsync<AccessClaims>(accessToken, {
        secret: this.config.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET')
      });
    } catch {
      return null;
    }
  }

  private async tryVerifyRefreshToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      return null;
    }
    try {
      return await this.jwt.verifyAsync<RefreshClaims>(refreshToken, {
        secret: this.config.getOrThrow<string>('AUTH_REFRESH_TOKEN_SECRET')
      });
    } catch {
      return null;
    }
  }

  private async revokeSessionFamily(userId: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
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
    return new Date(Date.now() + durationToMs(this.config.get<string>('AUTH_REFRESH_TOKEN_TTL') ?? defaultRefreshTokenTtl));
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
