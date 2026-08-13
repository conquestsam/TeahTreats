import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { ApiAdminEndpoint, ApiPublicEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { CatalogService } from '../application/catalog.service.js';
import {
  CreateProductImageDto,
  CreateProductImageUploadDto,
  UpdateProductImageDto
} from './dto/image-upload.dto.js';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto.js';
import { CreateSkuDto, UpdateSkuDto } from './dto/sku.dto.js';

@ApiTags('shop/catalog')
@Controller('shop/catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get('featured')
  @ApiPublicEndpoint('List featured storefront catalog products.')
  async listFeaturedProducts() {
    return {
      data: await this.catalog.listFeaturedProducts()
    };
  }
}

@ApiTags('admin/catalog')
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/catalog/products')
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @RequirePermissions(permissions.productsRead)
  @ApiAdminEndpoint('List tenant-scoped admin products.', { tenant: 'optional' })
  async listProducts(@CurrentTenant() tenantId: string) {
    return {
      data: await this.catalog.listProducts(tenantId)
    };
  }

  @Post()
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Create a tenant-scoped product draft.', { tenant: 'optional', csrf: true, status: 201 })
  async createProduct(@CurrentTenant() tenantId: string, @Body() dto: CreateProductDto) {
    return {
      data: await this.catalog.createProduct(tenantId, dto)
    };
  }

  @Get(':productId')
  @RequirePermissions(permissions.productsRead)
  @ApiAdminEndpoint('Get one tenant-scoped product with SKUs and images.', { tenant: 'optional' })
  async getProduct(@CurrentTenant() tenantId: string, @Param('productId') productId: string) {
    return {
      data: await this.catalog.getProduct(tenantId, productId)
    };
  }

  @Patch(':productId')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Update product metadata and status rules.', { tenant: 'optional', csrf: true })
  async updateProduct(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return {
      data: await this.catalog.updateProduct(tenantId, productId, dto)
    };
  }

  @Post(':productId/archive')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Archive a product so it leaves storefront visibility.', { tenant: 'optional', csrf: true, status: 201 })
  async archiveProduct(@CurrentTenant() tenantId: string, @Param('productId') productId: string) {
    return {
      data: await this.catalog.archiveProduct(tenantId, productId)
    };
  }

  @Post(':productId/restore')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Restore an archived product to draft status.', { tenant: 'optional', csrf: true, status: 201 })
  async restoreProduct(@CurrentTenant() tenantId: string, @Param('productId') productId: string) {
    return {
      data: await this.catalog.restoreProduct(tenantId, productId)
    };
  }

  @Post(':productId/skus')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Create a SKU under a tenant-scoped product.', { tenant: 'optional', csrf: true, status: 201 })
  async createSku(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateSkuDto,
  ) {
    return {
      data: await this.catalog.createSku(tenantId, productId, dto)
    };
  }

  @Patch(':productId/skus/:skuId')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Update SKU price, status, and metadata.', { tenant: 'optional', csrf: true })
  async updateSku(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body() dto: UpdateSkuDto,
  ) {
    return {
      data: await this.catalog.updateSku(tenantId, productId, skuId, dto)
    };
  }

  @Post(':productId/images/upload')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Create a signed product image upload target.', { tenant: 'optional', csrf: true, status: 201 })
  async createImageUpload(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateProductImageUploadDto,
  ) {
    return {
      data: await this.catalog.createProductImageUpload(tenantId, productId, dto)
    };
  }

  @Post(':productId/images')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Attach uploaded product image metadata.', { tenant: 'optional', csrf: true, status: 201 })
  async createImage(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return {
      data: await this.catalog.createProductImage(tenantId, productId, dto)
    };
  }

  @Patch(':productId/images/:imageId')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Update product image alt text and sort order.', { tenant: 'optional', csrf: true })
  async updateImage(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    return {
      data: await this.catalog.updateProductImage(tenantId, productId, imageId, dto)
    };
  }

  @Delete(':productId/images/:imageId')
  @RequirePermissions(permissions.productsWrite)
  @ApiAdminEndpoint('Remove product image metadata.', { tenant: 'optional', csrf: true })
  async removeImage(
    @CurrentTenant() tenantId: string,
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return {
      data: await this.catalog.removeProductImage(tenantId, productId, imageId)
    };
  }
}
