import { Module } from '@nestjs/common';
import { QueueModule } from '../infrastructure/queue/queue.module.js';
import { OrdersModule } from '../modules/orders/orders.module.js';
import { NotificationsModule } from '../modules/notifications/notifications.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { CacheInvalidationProcessor } from './processors/cache-invalidation.processor.js';
import { ExpiryAlertsProcessor } from './processors/expiry-alerts.processor.js';
import { InventoryReservationProcessor } from './processors/inventory-reservation.processor.js';
import { NotificationsProcessor } from './processors/notifications.processor.js';
import { OutboxProcessor } from './processors/outbox.processor.js';
import { RecommendationsProcessor } from './processors/recommendations.processor.js';
import { ReportExportProcessor } from './processors/report-export.processor.js';
import { SearchSyncProcessor } from './processors/search-sync.processor.js';
import { WorkerSchedulerService } from './worker-scheduler.service.js';

@Module({
  imports: [QueueModule, OrdersModule, RealtimeModule, NotificationsModule],
  providers: [
    WorkerSchedulerService,
    OutboxProcessor,
    NotificationsProcessor,
    SearchSyncProcessor,
    CacheInvalidationProcessor,
    InventoryReservationProcessor,
    RecommendationsProcessor,
    ExpiryAlertsProcessor,
    ReportExportProcessor
  ]
})
export class WorkerModule {}
