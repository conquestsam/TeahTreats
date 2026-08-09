import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator.js';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { StorefrontService } from '../application/storefront.service.js';
import { NewsletterSubscribeDto } from './dto/newsletter-subscribe.dto.js';
import { StorefrontProductListQueryDto, StorefrontSearchQueryDto } from './dto/storefront-query.dto.js';

@Public()
@ApiTags('shop/storefront')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(TenantScopeGuard)
@Controller('shop/storefront')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Get('products')
  @ApiOperation({ summary: 'List active storefront products with inventory-aware availability.' })
  async listProducts(@CurrentTenant() tenantId: string, @Query() query: StorefrontProductListQueryDto) {
    return {
      data: await this.storefront.listProducts(tenantId, query)
    };
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get an active storefront product by slug.' })
  async getProduct(@CurrentTenant() tenantId: string, @Param('slug') slug: string) {
    return {
      data: await this.storefront.getProductBySlug(tenantId, slug)
    };
  }

  @Get('search')
  @RateLimit({ limit: 60, windowSeconds: 60, keyPrefix: 'storefront-search' })
  @UseGuards(RateLimitGuard, TenantScopeGuard)
  @ApiOperation({ summary: 'Search storefront products with OpenSearch fallback.' })
  async searchProducts(@CurrentTenant() tenantId: string, @Query() query: StorefrontSearchQueryDto) {
    return {
      data: await this.storefront.searchProducts(tenantId, query)
    };
  }

  @Get('collections')
  @ApiOperation({ summary: 'List category collection summaries.' })
  async listCollections(@CurrentTenant() tenantId: string) {
    return {
      data: await this.storefront.listCollections(tenantId)
    };
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'List MVP recommendation sections.' })
  async listRecommendations(@CurrentTenant() tenantId: string) {
    return {
      data: await this.storefront.listRecommendations(tenantId)
    };
  }

  @Post('newsletter')
  @RateLimit({ limit: 10, windowSeconds: 60, keyPrefix: 'storefront-newsletter' })
  @UseGuards(RateLimitGuard, TenantScopeGuard)
  @ApiOperation({ summary: 'Subscribe an email to storefront newsletter updates.' })
  async subscribeToNewsletter(@CurrentTenant() tenantId: string, @Body() dto: NewsletterSubscribeDto) {
    return {
      data: await this.storefront.subscribeToNewsletter(tenantId, dto)
    };
  }
}
