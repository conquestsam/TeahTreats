import { Injectable } from '@nestjs/common';

@Injectable()
export class TracingService {
  startSpan(name: string) {
    return { name, startedAt: new Date() };
  }
}
