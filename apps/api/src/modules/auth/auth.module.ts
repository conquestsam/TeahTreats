import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OutboxModule } from '../outbox/outbox.module.js';
import { AdminMfaService } from './application/admin-mfa.service.js';
import { AuthCookieService } from './application/auth-cookie.service.js';
import { AuthService } from './application/auth.service.js';
import { AuthController } from './presentation/auth.controller.js';

@Module({
  imports: [JwtModule.register({}), OutboxModule],
  controllers: [AuthController],
  providers: [AdminMfaService, AuthService, AuthCookieService],
  exports: [AuthService, AuthCookieService]
})
export class AuthModule {}
