import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';

@Processor(queues.expiryAlerts)
export class ExpiryAlertsProcessor extends WorkerHost {
  async process(job: Job) {
    return { jobId: job.id, checkedExpiringBatches: true };
  }
}
