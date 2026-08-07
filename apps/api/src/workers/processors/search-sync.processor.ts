import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';

@Processor(queues.searchSync)
export class SearchSyncProcessor extends WorkerHost {
  async process(job: Job) {
    return { jobId: job.id, index: 'products-v1' };
  }
}
