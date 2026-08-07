import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VendorService } from './application/vendor.service.js';
import { VendorController } from './presentation/vendor.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService]
})
export class VendorModule {}
