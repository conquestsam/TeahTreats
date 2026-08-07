import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queues } from '../../infrastructure/queue/queue.module.js';

@Processor(queues.reportExport)
export class ReportExportProcessor extends WorkerHost {
  async process(job: Job) {
    return { jobId: job.id, exported: true };
  }
}
