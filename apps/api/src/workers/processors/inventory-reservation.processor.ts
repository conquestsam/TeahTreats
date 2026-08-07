import { Processor, WorkerHost } from '@nestjs/bullmq';
import { workerJobs } from '@snacks/shared';
import type { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';
import { OrdersService } from '../../modules/orders/application/orders.service.js';

@Processor(queues.inventoryReservation)
export class InventoryReservationProcessor extends WorkerHost {
  constructor(private readonly orders: OrdersService) {
    super();
  }

  async process(job: Job<{ limit?: number }>) {
    if (job.name !== workerJobs.releaseExpiredReservations) {
      return { skipped: true };
    }

    return this.orders.expireUnpaidReservations(job.data.limit ?? 50);
  }
}
