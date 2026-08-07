import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';

@Processor(queues.recommendations)
export class RecommendationsProcessor extends WorkerHost {
  async process(job: Job) {
    return { jobId: job.id, recomputed: true };
  }
}
