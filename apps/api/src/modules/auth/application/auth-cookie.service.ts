import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { authExceptions } from '../../../common/errors/auth-contract.exception.js';

const accessCookieName = 'access_token';
const refreshCookieName = 'refresh_token';
const csrfCookieName = 'csrf_token';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService) {}

  setAuthCookies(response: Response, tokens: { accessToken: string; refreshToken: string }) {
    response.cookie(accessCookieName, tokens.accessToken, {
      ...this.baseCookieOptions(),
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    response.cookie(refreshCookieName, tokens.refreshToken, {
      ...this.baseCookieOptions(),
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth'
    });
  }

  issueCsrfCookie(response: Response) {
    const csrfToken = randomBytes(32).toString('base64url');
    response.cookie(csrfCookieName, csrfToken, {
      ...this.baseCookieOptions(),
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    return csrfToken;
  }

  clearAuthCookies(response: Response) {
    for (const options of [
      { name: accessCookieName, path: '/' },
      { name: refreshCookieName, path: '/api/v1/auth' },
      { name: csrfCookieName, path: '/' }
    ]) {
      response.clearCookie(options.name, {
        ...this.baseCookieOptions(),
        path: options.path
      });
    }
  }

  assertCsrf(requestParts: {
    cookies: Record<string, string | undefined> | undefined;
    headers: Record<string, string | string[] | undefined>;
  }) {
    const csrfCookie = requestParts.cookies?.csrf_token;
    const csrfHeader = requestParts.headers['x-csrf-token'];
    const csrfHeaderValue = Array.isArray(csrfHeader) ? csrfHeader[0] : csrfHeader;

    if (!csrfCookie || !csrfHeaderValue) {
      throw authExceptions.csrfRequired();
    }

    if (!this.equals(csrfCookie, csrfHeaderValue)) {
      throw authExceptions.csrfInvalid();
    }
  }

  private equals(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }

  private baseCookieOptions() {
    const domain = this.config.get<string>('AUTH_COOKIE_DOMAIN');
    const sameSite = this.config.get<'lax' | 'strict' | 'none'>('AUTH_COOKIE_SAMESITE') ?? 'lax';
    const configuredSecure = this.config.get<boolean | undefined>('AUTH_COOKIE_SECURE');
    const secure = configuredSecure ?? (this.config.get<string>('NODE_ENV') === 'production' || sameSite === 'none');
    return {
      sameSite,
      secure,
      ...(domain ? { domain } : {})
    };
  }
}
