import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.tokens.js';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  get client() {
    return this.redis;
  }

  setJson(key: string, value: unknown, ttlSeconds: number) {
    return this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getJson<TValue>(key: string): Promise<TValue | null> {
    const value = await this.redis.get(key);
    return value ? (JSON.parse(value) as TValue) : null;
  }

  async incrementRateLimit(key: string, windowSeconds: number) {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
    }
    return count;
  }
}
