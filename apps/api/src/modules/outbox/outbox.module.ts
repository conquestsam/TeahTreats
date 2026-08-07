import { Module } from '@nestjs/common';
import { OutboxService } from './application/outbox.service.js';

@Module({
  providers: [OutboxService],
  exports: [OutboxService]
})
export class OutboxModule {}
