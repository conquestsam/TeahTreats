import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditReviewService } from './application/audit-review.service.js';
import { AuditReviewController } from './presentation/audit-review.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuditReviewController],
  providers: [AuditReviewService]
})
export class AuditModule {}
