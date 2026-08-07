import { Global, Module } from '@nestjs/common';
import { AppLogger } from './logger/app-logger.service.js';
import { MetricsService } from './metrics/metrics.service.js';
import { TracingService } from './tracing/tracing.service.js';

@Global()
@Module({
  providers: [AppLogger, MetricsService, TracingService],
  exports: [AppLogger, MetricsService, TracingService]
})
export class ObservabilityModule {}
