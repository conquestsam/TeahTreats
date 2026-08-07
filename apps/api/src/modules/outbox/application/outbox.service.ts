import { Injectable } from '@nestjs/common';
import type { DomainEventEnvelope } from '@snacks/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(event: DomainEventEnvelope) {
    return this.prisma.outboxEvent.create({
      data: {
        id: event.id,
        name: event.name,
        tenantId: event.tenantId,
        aggregateId: event.aggregateId,
        payload: event.payload as Prisma.InputJsonValue,
        createdAt: new Date(event.occurredAt)
      }
    });
  }
}
