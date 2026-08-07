import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminCatalogController, CatalogController } from './presentation/catalog.controller.js';
import { CatalogService } from './application/catalog.service.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService],
  exports: [CatalogService]
})
export class CatalogModule {}
