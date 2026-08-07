import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { NotificationInfrastructureModule } from './infrastructure/notifications/notification-infrastructure.module.js';
import { ObservabilityModule } from './infrastructure/observability/observability.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { SearchInfrastructureModule } from './infrastructure/search/opensearch.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { WorkerModule } from './workers/worker.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    DatabaseModule,
    RedisModule,
    QueueModule,
    SearchInfrastructureModule,
    NotificationInfrastructureModule,
    ObservabilityModule,
    OrdersModule,
    NotificationsModule,
    RealtimeModule,
    WorkerModule
  ]
})
export class WorkerRuntimeModule {}
