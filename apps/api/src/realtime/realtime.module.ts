import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeEventsService } from './realtime-events.service.js';
import { SseController } from './sse.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SseController],
  providers: [RealtimeEventsService],
  exports: [RealtimeEventsService]
})
export class RealtimeModule {}
