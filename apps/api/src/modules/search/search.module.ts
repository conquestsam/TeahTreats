import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SearchAdminService } from './application/search-admin.service.js';
import { SearchAdminController } from './presentation/search-admin.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SearchAdminController],
  providers: [SearchAdminService]
})
export class SearchModule {}
