import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublicEndpoint } from '../../../common/decorators/openapi.decorator.js';

@ApiTags('admin/operations')
@Controller('admin/operations')
export class AdminOperationsController {
  @Get('summary')
  @ApiPublicEndpoint('Get lightweight admin operations summary placeholder.')
  summary() {
    return {
      data: {
        paidOrders: 0,
        manualProofsAwaitingReview: 0,
        lowStockAlerts: 0,
        readyOrders: 0
      }
    };
  }
}
