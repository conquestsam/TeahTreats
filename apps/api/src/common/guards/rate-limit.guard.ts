import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../infrastructure/redis/redis.service.js';
import { RATE_LIMIT_METADATA, type RateLimitOptions } from '../decorators/rate-limit.decorator.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_METADATA, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      ip?: string;
      method: string;
      route?: { path?: string };
      originalUrl?: string;
      headers: Record<string, string | string[] | undefined>;
      tenantId?: string;
    }>();
    const key = this.keyForRequest(request, options);
    try {
      const count = await this.redis.incrementRateLimit(key, options.windowSeconds);
      if (count > options.limit) {
        throw new HttpException('Too many requests. Please wait and try again.', HttpStatus.TOO_MANY_REQUESTS);
      }
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Redis rate limit check failed', error);
      throw new HttpException('Rate limit service is unavailable. Please try again.', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  private keyForRequest(
    request: {
      ip?: string;
      method: string;
      route?: { path?: string };
      originalUrl?: string;
      headers: Record<string, string | string[] | undefined>;
      tenantId?: string;
    },
    options: RateLimitOptions,
  ) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedValue = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const ip = forwardedValue?.split(',')[0]?.trim() || request.ip || 'unknown';
    const route = request.route?.path || request.originalUrl?.split('?')[0] || 'unknown-route';
    const tenant = request.tenantId ?? 'public';
    return ['rate-limit', options.keyPrefix ?? 'route', tenant, request.method.toUpperCase(), route, ip].join(':');
  }
}
