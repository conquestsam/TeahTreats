import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { domainEvents } from '@snacks/shared';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { OAuthProvider, Prisma, UserType } from '@prisma/client';
import { authExceptions } from '../../../common/errors/auth-contract.exception.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CustomerAuthService } from './customer-auth.service.js';

interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

interface OAuthStartInput {
  provider: OAuthProvider;
  tenantId: string;
  redirectTo?: string | undefined;
}

interface OAuthCallbackInput extends OAuthStartInput {
  code?: string | undefined;
  state?: string | undefined;
  context: RequestContext;
}

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

@Injectable()
export class CustomerOAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly customerAuth: CustomerAuthService,
  ) {}

  async start(input: OAuthStartInput) {
    if (input.provider !== OAuthProvider.google) {
      throw authExceptions.oauthUnavailable();
    }
    const config = this.googleConfig();
    const state = randomBytes(32).toString('base64url');
    const codeVerifier = randomBytes(48).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    const tenantId = await this.resolveTenantId(input.tenantId);

    const redirectTo = this.safeRedirect(input.redirectTo);
    await this.prisma.oAuthLoginState.create({
      data: {
        stateHash: this.hash(state),
        codeVerifier,
        provider: OAuthProvider.google,
        tenantId,
        ...(redirectTo ? { redirectTo } : {}),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account'
    });

    return { authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` };
  }

  async complete(input: Omit<OAuthCallbackInput, 'tenantId'>) {
    if (input.provider !== OAuthProvider.google) {
      throw authExceptions.oauthUnavailable();
    }
    if (!input.code || !input.state) {
      throw authExceptions.oauthInvalidState();
    }

    const state = await this.consumeState(input.state);
    const tokens = await this.exchangeGoogleCode(input.code, state.codeVerifier);
    const profile = await this.fetchGoogleProfile(tokens.access_token);
    if (!profile.email || profile.email_verified === false) {
      throw authExceptions.oauthFailed();
    }

    const user = await this.findOrCreateCustomer(profile);
    const result = await this.customerAuth.createCustomerSession(user, state.tenantId, input.context);
    await this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        tenantId: state.tenantId,
        aggregateId: user.id,
        name: domainEvents.customerLoggedIn,
        payload: {
          userId: user.id,
          email: user.email,
          customerName: user.name,
          provider: OAuthProvider.google,
          reason: 'customer-oauth'
        } as Prisma.InputJsonValue
      }
    });

    return {
      tokens: result.tokens,
      user: result.user,
      redirectTo: state.redirectTo ?? '/account'
    };
  }

  private async findOrCreateCustomer(profile: GoogleProfile) {
    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: OAuthProvider.google,
          providerAccountId: profile.sub
        }
      },
      include: { user: true }
    });
    if (existingAccount?.user && !existingAccount.user.deletedAt) {
      return existingAccount.user;
    }

    const email = profile.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.userType !== UserType.customer) {
      throw authExceptions.oauthFailed();
    }

    const user = existingUser ?? await this.prisma.user.create({
      data: {
        email,
        name: profile.name?.trim() || email.split('@')[0] || 'Customer',
        userType: UserType.customer
      }
    });

    await this.prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: OAuthProvider.google,
          providerAccountId: profile.sub
        }
      },
      update: {
        email,
        profile: profile as unknown as Prisma.InputJsonValue
      },
      create: {
        userId: user.id,
        provider: OAuthProvider.google,
        providerAccountId: profile.sub,
        email,
        profile: profile as unknown as Prisma.InputJsonValue
      }
    });

    if (!existingUser) {
      await this.prisma.outboxEvent.create({
        data: {
          id: randomUUID(),
          tenantId: null,
          aggregateId: user.id,
          name: domainEvents.customerSignedUp,
          payload: {
            userId: user.id,
            email: user.email,
            customerName: user.name,
            provider: OAuthProvider.google
          } as Prisma.InputJsonValue
        }
      });
    }

    return user;
  }

  private async consumeState(rawState: string) {
    const state = await this.prisma.oAuthLoginState.findUnique({
      where: { stateHash: this.hash(rawState) }
    });
    if (!state || state.provider !== OAuthProvider.google || state.consumedAt || state.expiresAt <= new Date()) {
      throw authExceptions.oauthInvalidState();
    }
    await this.prisma.oAuthLoginState.update({
      where: { id: state.id },
      data: { consumedAt: new Date() }
    });
    return state;
  }

  private async exchangeGoogleCode(code: string, codeVerifier: string) {
    const config = this.googleConfig();
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier
      })
    });
    if (!response.ok) {
      throw authExceptions.oauthFailed();
    }
    return response.json() as Promise<{ access_token: string }>;
  }

  private async fetchGoogleProfile(accessToken: string) {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      throw authExceptions.oauthFailed();
    }
    return response.json() as Promise<GoogleProfile>;
  }

  private googleConfig() {
    const clientId = this.config.get<string>('OAUTH_GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('OAUTH_GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('OAUTH_GOOGLE_REDIRECT_URI');
    if (!clientId || !clientSecret || !redirectUri) {
      throw authExceptions.oauthUnavailable();
    }
    return { clientId, clientSecret, redirectUri };
  }

  private safeRedirect(value: string | undefined) {
    if (!value) {
      return undefined;
    }
    if (!value.startsWith('/') || value.startsWith('//') || value.length > 200) {
      return undefined;
    }
    return value;
  }

  private async resolveTenantId(tenantIdOrSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        active: true,
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }]
      },
      select: { id: true }
    });
    if (!tenant) {
      throw new BadRequestException('Tenant was not found.');
    }
    return tenant.id;
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
