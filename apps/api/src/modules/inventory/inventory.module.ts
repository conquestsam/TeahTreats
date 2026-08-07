import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InventoryService } from './application/inventory.service.js';
import { InventoryController } from './presentation/inventory.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {}
