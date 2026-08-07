import { Module } from '@nestjs/common';
import { HealthService } from './application/health.service.js';
import { HealthController } from './presentation/health.controller.js';

@Module({
  controllers: [HealthController],
  providers: [HealthService]
})
export class HealthModule {}
