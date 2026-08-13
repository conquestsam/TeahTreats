import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublicEndpoint } from '../../../common/decorators/openapi.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { HealthService } from '../application/health.service.js';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiPublicEndpoint('Check API and dependency health.')
  check() {
    return this.health.check();
  }
}
