import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { domainEvents } from '@snacks/shared';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { Prisma, UserType } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CartService } from '../../cart/application/cart.service.js';
import type { CustomerLoginDto, CustomerSignupDto } from '../presentation/dto/customer-auth.dto.js';

interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

interface CustomerAccessClaims {
  sub: string;
  email: string;
  name: string;
  phone?: string | null;
  userType: 'customer';
  sessionId: string;
  tenantIds: string[];
  permissions: string[];
}

interface RefreshClaims {
  sub: string;
  sessionId: string;
}

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly cart: CartService,
  ) { }

  async signup(tenantId: string, sessionId: string | undefined, dto: CustomerSignupDto, context: RequestContext) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new BadRequestException('An account already exists for this email.');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        userType: UserType.customer,
        passwordHash: await argon2.hash(dto.password)
      }
    });
    const result = await this.createSession(user, resolvedTenantId, context);
    await this.cart.mergeGuestCartIntoCustomer(resolvedTenantId, sessionId, user.id);
    await this.writeOutbox(resolvedTenantId, user.id, domainEvents.customerSignedUp, {
      userId: user.id,
      email: user.email
    });
    await this.writeOutbox(resolvedTenantId, user.id, domainEvents.cartMigrated, {
      userId: user.id,
      reason: 'customer-signup'
    });
    return result;
  }

  async login(tenantId: string, sessionId: string | undefined, dto: CustomerLoginDto, context: RequestContext) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.passwordHash || user.deletedAt || user.userType !== UserType.customer) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const result = await this.createSession(user, resolvedTenantId, context);
    await this.cart.mergeGuestCartIntoCustomer(resolvedTenantId, sessionId, user.id);
    await this.writeOutbox(resolvedTenantId, user.id, domainEvents.customerLoggedIn, {
      userId: user.id,
      sessionId: result.user.sessionId
    });
    await this.writeOutbox(resolvedTenantId, user.id, domainEvents.cartMigrated, {
      userId: user.id,
      reason: 'customer-login'
    });
    return result;
  }

  async refresh(refreshToken: string | undefined, tenantId: string, context: RequestContext) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh session is required.');
    }
    const claims = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { id: claims.sessionId },
      include: { user: true }
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.deletedAt ||
      session.user.userType !== UserType.customer
    ) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }
    const matchesStoredToken = await argon2.verify(session.refreshTokenHash, refreshToken);
    if (!matchesStoredToken) {
      throw new UnauthorizedException('Refresh session is invalid.');
    }

    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const access = this.buildAccessClaims(session.user, session.id, resolvedTenantId);
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

    return { tokens, user: this.safeUser(access) };
  }

  async logout(userId: string, sessionId: string, tenantId: string | undefined) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await this.writeOutbox(tenantId ?? null, userId, domainEvents.customerLoggedOut, { userId, sessionId });
    return { ok: true };
  }

  safeUser(user: CustomerAccessClaims) {
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      phone: user.phone ?? null,
      userType: user.userType,
      sessionId: user.sessionId,
      tenantIds: user.tenantIds
    };
  }

  private async createSession(
    user: { id: string; email: string; name: string; phone?: string | null; userType: UserType },
    tenantId: string,
    context: RequestContext,
  ) {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        expiresAt: this.refreshExpiresAt(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });
    const access = this.buildAccessClaims(user, session.id, tenantId);
    const tokens = await this.issueTokens(access);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: await argon2.hash(tokens.refreshToken) }
    });
    return { tokens, user: this.safeUser(access) };
  }

  private buildAccessClaims(
    user: { id: string; email: string; name: string; phone?: string | null; userType: UserType },
    sessionId: string,
    tenantId: string,
  ): CustomerAccessClaims {
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone ?? null,
      userType: 'customer',
      sessionId,
      tenantIds: [tenantId],
      permissions: []
    };
  }

  private async issueTokens(access: CustomerAccessClaims) {
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

  private refreshExpiresAt() {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }] }
    });
    if (!tenant) {
      throw new BadRequestException('Tenant was not found.');
    }
    return tenant.id;
  }

  private writeOutbox(
    tenantId: string | null,
    aggregateId: string,
    name: (typeof domainEvents)[keyof typeof domainEvents],
    payload: Record<string, unknown>,
  ) {
    return this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId,
        aggregateId,
        name,
        payload: payload as Prisma.InputJsonValue
      }
    });
  }
}
