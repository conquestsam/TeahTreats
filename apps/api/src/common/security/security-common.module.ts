import { Global, Module } from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard.js';

@Global()
@Module({
  providers: [RateLimitGuard],
  exports: [RateLimitGuard]
})
export class SecurityCommonModule {}
