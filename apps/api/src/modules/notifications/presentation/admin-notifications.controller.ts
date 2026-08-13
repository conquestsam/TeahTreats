import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { ApiAdminEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { AdminNotificationsService } from '../application/admin-notifications.service.js';
import { ListNotificationsQueryDto, SmokeTestNotificationDto } from './dto/admin-notifications.dto.js';

@ApiTags('admin/notifications')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notifications: AdminNotificationsService) {}

  @Get()
  @RequirePermissions(permissions.notificationsRead)
  @ApiAdminEndpoint('List tenant notification delivery logs.', { tenant: 'optional' })
  async list(@CurrentTenant() tenantId: string, @Query() query: ListNotificationsQueryDto) {
    return { data: await this.notifications.list(tenantId, query.status) };
  }

  @Post(':notificationId/retry')
  @RequirePermissions(permissions.notificationsRead)
  @ApiAdminEndpoint('Retry a failed or skipped notification.', { tenant: 'optional' })
  async retry(@CurrentTenant() tenantId: string, @Param('notificationId') notificationId: string) {
    return { data: await this.notifications.retry(tenantId, notificationId) };
  }

  @Post('smoke-test')
  @RequirePermissions(permissions.notificationsRead)
  @ApiAdminEndpoint('Create and immediately attempt delivery for test notifications.', { tenant: 'optional' })
  async smokeTest(@CurrentTenant() tenantId: string, @Body() dto: SmokeTestNotificationDto) {
    return { data: await this.notifications.smokeTest(tenantId, dto) };
  }
}
