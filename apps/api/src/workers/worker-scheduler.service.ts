import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { workerJobs } from '@snacks/shared';
import type { Queue } from 'bullmq';
import { queues } from '../infrastructure/queue/queue.module.js';

@Injectable()
export class WorkerSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue(queues.outbox) private readonly outboxQueue: Queue,
    @InjectQueue(queues.notifications) private readonly notificationsQueue: Queue,
    @InjectQueue(queues.inventoryReservation) private readonly inventoryReservationQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.outboxQueue.add(
      workerJobs.processOutbox,
      { limit: 50 },
      {
        jobId: workerJobs.processOutbox,
        repeat: { every: 5_000 },
        removeOnComplete: true,
        removeOnFail: 100
      },
    );
    await this.notificationsQueue.add(
      workerJobs.deliverNotifications,
      { limit: 50 },
      {
        jobId: workerJobs.deliverNotifications,
        repeat: { every: 10_000 },
        removeOnComplete: true,
        removeOnFail: 100
      },
    );
    await this.inventoryReservationQueue.add(
      workerJobs.releaseExpiredReservations,
      { limit: 50 },
      {
        jobId: workerJobs.releaseExpiredReservations,
        repeat: { every: 30_000 },
        removeOnComplete: true,
        removeOnFail: 100
      },
    );
  }
}
