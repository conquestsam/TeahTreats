import { BadRequestException, Controller, Get, MessageEvent, Query, Sse, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { permissions, realtimeTopics } from '@snacks/shared';
import { map, merge, Observable, of } from 'rxjs';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiAdminEndpoint, ApiEndpoint } from '../common/decorators/openapi.decorator.js';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { JwtAccessAuthGuard } from '../common/guards/jwt-access-auth.guard.js';
import { OptionalCustomerAuthGuard } from '../common/guards/optional-customer-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard.js';
import { PrismaService } from '../infrastructure/database/prisma.service.js';
import type { AuthenticatedUser } from '../common/types/authenticated-request.js';
import { CustomerOrderStreamDto } from './dto/customer-order-stream.dto.js';
import { RealtimeEventsService } from './realtime-events.service.js';

@ApiTags('realtime')
@Controller('realtime')
export class SseController {
  constructor(
    private readonly realtime: RealtimeEventsService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse('admin')
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-tenant-id',
    required: false,
    description: 'Development fallback only. EventSource cannot set custom headers, so cookie tenant fallback is supported.'
  })
  @UseGuards(JwtAccessAuthGuard, TenantScopeGuard, PermissionsGuard)
  @RequirePermissions(permissions.ordersRead)
  @ApiAdminEndpoint('Tenant-scoped admin realtime stream.', {
    tenant: 'optional',
    okDescription: 'Server-sent event stream for admin tenant events.'
  })
  admin(@CurrentTenant() tenantId: string): Observable<MessageEvent> {
    const hello = of({
      type: 'heartbeat',
      data: {
        topic: realtimeTopics.adminTenant,
        tenantId,
        occurredAt: new Date().toISOString()
      }
    });

    return merge(
      hello,
      this.realtime.stream((event) => event.topic === realtimeTopics.adminTenant && event.tenantId === tenantId),
    );
  }

  @Get('customer-order/verify')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'EventSource verification uses tenantId query fallback.' })
  @ApiEndpoint({
    summary: 'Verify a customer order stream before opening SSE.',
    tenant: 'optional',
    auth: 'optional'
  })
  async verifyCustomerOrder(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('tenantId') tenantId: string,
    @Query() dto: CustomerOrderStreamDto,
  ) {
    const resolvedTenantId = tenantId || user?.tenantIds[0];
    if (!resolvedTenantId) {
      throw new BadRequestException('Tenant context is required.');
    }
    await this.ensureCustomerCanStream(resolvedTenantId, dto, user);
    return { data: { ok: true } };
  }

  @Sse('customer-order')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'EventSource uses tenantId query fallback.' })
  @ApiEndpoint({
    summary: 'Customer order realtime stream using temporary customer verification.',
    tenant: 'optional',
    auth: 'optional',
    okDescription: 'Server-sent event stream for one customer order.'
  })
  async customerOrder(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('tenantId') tenantId: string,
    @Query() dto: CustomerOrderStreamDto,
  ): Promise<Observable<MessageEvent>> {
    const resolvedTenantId = tenantId || user?.tenantIds[0];
    if (!resolvedTenantId) {
      throw new BadRequestException('Tenant context is required.');
    }
    await this.ensureCustomerCanStream(resolvedTenantId, dto, user);
    const hello = of({
      type: 'heartbeat',
      data: {
        topic: realtimeTopics.customerOrder,
        tenantId: resolvedTenantId,
        orderId: dto.orderId,
        occurredAt: new Date().toISOString()
      }
    });

    return merge(
      hello,
      this.realtime.stream(
        (event) =>
          event.topic === realtimeTopics.customerOrder &&
          event.tenantId === resolvedTenantId &&
          event.orderId === dto.orderId,
      ),
    ).pipe(map((event) => event));
  }

  private async ensureCustomerCanStream(tenantId: string, dto: CustomerOrderStreamDto, user?: AuthenticatedUser) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
      select: { customer: true, userId: true }
    });
    if (!order || !order.customer || typeof order.customer !== 'object' || Array.isArray(order.customer)) {
      throw new BadRequestException('Order was not found.');
    }

    if (user?.userType === 'customer' && order.userId === user.id) {
      return;
    }

    const customer = order.customer as Record<string, unknown>;
    if (customer.email !== dto.email.toLowerCase() || customer.phone !== dto.phone.trim()) {
      throw new BadRequestException('Customer details do not match this order.');
    }
  }
}
