import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const queues = {
  outbox: 'outbox',
  notifications: 'notifications',
  searchSync: 'search-sync',
  cacheInvalidation: 'cache-invalidation',
  inventoryReservation: 'inventory-reservation',
  recommendations: 'recommendations',
  expiryAlerts: 'expiry-alerts',
  reportExport: 'report-export'
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>('REDIS_URL')
        }
      })
    }),
    BullModule.registerQueue(
      ...Object.values(queues).map((name) => ({
        name
      })),
    )
  ],
  exports: [BullModule]
})
export class QueueModule {}
