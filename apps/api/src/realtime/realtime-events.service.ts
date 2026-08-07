import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject, filter, map } from 'rxjs';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../infrastructure/redis/redis.tokens.js';

export interface RealtimeEnvelope {
  topic: string;
  type: string;
  tenantId: string | null;
  orderId?: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

@Injectable()
export class RealtimeEventsService implements OnModuleInit, OnModuleDestroy {
  private readonly events = new Subject<RealtimeEnvelope>();
  private subscriber: Redis | null = null;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit() {
    this.subscriber = this.redis.duplicate();
    await this.subscriber.psubscribe('realtime:*');
    this.subscriber.on('pmessage', (_pattern, _channel, message) => {
      try {
        this.events.next(JSON.parse(message) as RealtimeEnvelope);
      } catch {
        // Ignore malformed messages from external Redis publishers.
      }
    });
  }

  async onModuleDestroy() {
    await this.subscriber?.quit();
  }

  async publish(input: Omit<RealtimeEnvelope, 'occurredAt'>) {
    const envelope: RealtimeEnvelope = {
      ...input,
      occurredAt: new Date().toISOString()
    };
    await this.redis.publish(this.channel(input.topic), JSON.stringify(envelope));
    return envelope;
  }

  stream(predicate: (event: RealtimeEnvelope) => boolean) {
    return this.events.asObservable().pipe(
      filter(predicate),
      map((event) => ({
        type: event.type,
        data: event
      })),
    );
  }

  private channel(topic: string) {
    return `realtime:${topic}`;
  }
}
