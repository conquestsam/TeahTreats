import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../../../common/decorators/openapi.decorator.js';
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
  @ApiEndpoint({ summary: 'List active storefront products with inventory-aware availability.', tenant: 'required', auth: 'none' })
  async listProducts(@CurrentTenant() tenantId: string, @Query() query: StorefrontProductListQueryDto) {
    return {
      data: await this.storefront.listProducts(tenantId, query)
    };
  }

  @Get('products/:slug')
  @ApiEndpoint({ summary: 'Get an active storefront product by slug.', tenant: 'required', auth: 'none' })
  async getProduct(@CurrentTenant() tenantId: string, @Param('slug') slug: string) {
    return {
      data: await this.storefront.getProductBySlug(tenantId, slug)
    };
  }

  @Get('search')
  @RateLimit({ limit: 60, windowSeconds: 60, keyPrefix: 'storefront-search' })
  @UseGuards(RateLimitGuard, TenantScopeGuard)
  @ApiEndpoint({ summary: 'Search storefront products with OpenSearch fallback.', tenant: 'required', auth: 'none' })
  async searchProducts(@CurrentTenant() tenantId: string, @Query() query: StorefrontSearchQueryDto) {
    return {
      data: await this.storefront.searchProducts(tenantId, query)
    };
  }

  @Get('collections')
  @ApiEndpoint({ summary: 'List category collection summaries.', tenant: 'required', auth: 'none' })
  async listCollections(@CurrentTenant() tenantId: string) {
    return {
      data: await this.storefront.listCollections(tenantId)
    };
  }

  @Get('recommendations')
  @ApiEndpoint({ summary: 'List MVP recommendation sections.', tenant: 'required', auth: 'none' })
  async listRecommendations(@CurrentTenant() tenantId: string) {
    return {
      data: await this.storefront.listRecommendations(tenantId)
    };
  }

  @Post('newsletter')
  @RateLimit({ limit: 10, windowSeconds: 60, keyPrefix: 'storefront-newsletter' })
  @UseGuards(RateLimitGuard, TenantScopeGuard)
  @ApiEndpoint({ summary: 'Subscribe an email to storefront newsletter updates.', tenant: 'required', auth: 'none' })
  async subscribeToNewsletter(@CurrentTenant() tenantId: string, @Body() dto: NewsletterSubscribeDto) {
    return {
      data: await this.storefront.subscribeToNewsletter(tenantId, dto)
    };
  }
}
