import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { CustomerAccessAuthGuard } from '../../../common/guards/customer-access-auth.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { LoyaltyFoundationsService } from '../application/loyalty-foundations.service.js';

@ApiTags('shop/loyalty')
@ApiCookieAuth('customer_access_token')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(CustomerAccessAuthGuard, TenantScopeGuard)
@Controller('shop/loyalty')
export class CustomerLoyaltyController {
  constructor(private readonly foundations: LoyaltyFoundationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get loyalty points and quest progress.' })
  async summary(@CurrentTenant() tenantId: string, @CurrentUser() user: AuthenticatedUser) {
    return { data: await this.foundations.getLoyalty(tenantId, user) };
  }

  @Post('quests/:questId/claim')
  @ApiOperation({ summary: 'Claim a completed quest reward.' })
  async claim(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('questId') questId: string,
  ) {
    return { data: await this.foundations.claimQuestReward(tenantId, user, questId) };
  }
}
