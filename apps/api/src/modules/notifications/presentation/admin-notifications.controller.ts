import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { AdminNotificationsService } from '../application/admin-notifications.service.js';
import { ListNotificationsQueryDto } from './dto/admin-notifications.dto.js';

@ApiTags('admin/notifications')
@ApiCookieAuth('access_token')
@ApiHeader({ name: 'x-tenant-id', required: false })
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notifications: AdminNotificationsService) {}

  @Get()
  @RequirePermissions(permissions.notificationsRead)
  @ApiOperation({ summary: 'List tenant notification delivery logs.' })
  async list(@CurrentTenant() tenantId: string, @Query() query: ListNotificationsQueryDto) {
    return { data: await this.notifications.list(tenantId, query.status) };
  }

  @Post(':notificationId/retry')
  @RequirePermissions(permissions.notificationsRead)
  @ApiOperation({ summary: 'Retry a failed or skipped notification.' })
  async retry(@CurrentTenant() tenantId: string, @Param('notificationId') notificationId: string) {
    return { data: await this.notifications.retry(tenantId, notificationId) };
  }
}
