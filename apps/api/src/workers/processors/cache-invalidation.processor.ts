import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';

@Processor(queues.cacheInvalidation)
export class CacheInvalidationProcessor extends WorkerHost {
  async process(job: Job) {
    return { jobId: job.id, invalidated: true };
  }
}
