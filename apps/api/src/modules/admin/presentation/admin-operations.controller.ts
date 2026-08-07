import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin/operations')
@Controller('admin/operations')
export class AdminOperationsController {
  @Get('summary')
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
