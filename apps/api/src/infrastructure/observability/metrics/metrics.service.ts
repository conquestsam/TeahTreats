import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  increment(name: string, labels: Record<string, string> = {}) {
    return { name, labels };
  }
}
