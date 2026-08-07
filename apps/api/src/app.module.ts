import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema.js';
import { SecurityCommonModule } from './common/security/security-common.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { SearchInfrastructureModule } from './infrastructure/search/opensearch.module.js';
import { StorageModule } from './infrastructure/storage/storage.module.js';
import { NotificationInfrastructureModule } from './infrastructure/notifications/notification-infrastructure.module.js';
import { PaymentInfrastructureModule } from './infrastructure/payments/payment-infrastructure.module.js';
import { ObservabilityModule } from './infrastructure/observability/observability.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { RbacModule } from './modules/rbac/rbac.module.js';
import { TenancyModule } from './modules/tenancy/tenancy.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { StorefrontModule } from './modules/storefront/storefront.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { CheckoutModule } from './modules/checkout/checkout.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { ManualPaymentsModule } from './modules/manual-payments/manual-payments.module.js';
import { PromotionsModule } from './modules/promotions/promotions.module.js';
import { LoyaltyModule } from './modules/loyalty/loyalty.module.js';
import { RecommendationsModule } from './modules/recommendations/recommendations.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AdminTenantsModule } from './modules/admin-tenants/admin-tenants.module.js';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module.js';
import { VendorModule } from './modules/vendor/vendor.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { OutboxModule } from './modules/outbox/outbox.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    SecurityCommonModule,
    DatabaseModule,
    RedisModule,
    QueueModule,
    SearchInfrastructureModule,
    StorageModule,
    NotificationInfrastructureModule,
    PaymentInfrastructureModule,
    ObservabilityModule,
    HealthModule,
    AuthModule,
    CustomerAuthModule,
    UsersModule,
    RbacModule,
    TenancyModule,
    CatalogModule,
    StorefrontModule,
    MediaModule,
    InventoryModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
    ManualPaymentsModule,
    PromotionsModule,
    LoyaltyModule,
    RecommendationsModule,
    SearchModule,
    NotificationsModule,
    AuditModule,
    AdminModule,
    AdminTenantsModule,
    AdminSettingsModule,
    VendorModule,
    ReportsModule,
    OutboxModule,
    RealtimeModule,
    WebhooksModule
  ]
})
export class AppModule {}
