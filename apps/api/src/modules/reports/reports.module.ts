import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReportsService } from './application/reports.service.js';
import { ReportsController } from './presentation/reports.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
