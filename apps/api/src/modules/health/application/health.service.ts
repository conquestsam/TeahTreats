import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { RedisService } from '../../../infrastructure/redis/redis.service.js';
import { OpenSearchService } from '../../../infrastructure/search/opensearch.service.js';

export type DependencyState = 'ok' | 'degraded';

export interface DependencyHealth {
  status: DependencyState;
  latencyMs: number;
  message?: string;
}

export interface HealthCheckResult {
  status: DependencyState;
  service: 'snacks-api';
  timestamp: string;
  dependencies: {
    database: DependencyHealth;
    redis: DependencyHealth;
    openSearch: DependencyHealth;
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly openSearch: OpenSearchService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [database, redis, openSearch] = await Promise.all([
      this.measure('database', async () => {
        await this.prisma.$queryRaw`SELECT 1`;
      }),
      this.measure('redis', async () => {
        await this.redis.client.ping();
      }),
      this.measure('opensearch', async () => {
        await this.openSearch.ping();
      })
    ]);

    const dependencies = { database, redis, openSearch };
    const status = Object.values(dependencies).every((dependency) => dependency.status === 'ok') ? 'ok' : 'degraded';

    return {
      status,
      service: 'snacks-api',
      timestamp: new Date().toISOString(),
      dependencies
    };
  }

  private async measure(_name: string, check: () => Promise<unknown>): Promise<DependencyHealth> {
    const startedAt = Date.now();
    try {
      await check();
      return {
        status: 'ok',
        latencyMs: Date.now() - startedAt
      };
    } catch (error) {
      return {
        status: 'degraded',
        latencyMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : 'Dependency check failed.'
      };
    }
  }
}
