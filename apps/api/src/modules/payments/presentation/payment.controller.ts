import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { IdempotencyKey } from '../../../common/decorators/idempotency-key.decorator.js';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import { PaymentReconciliationService } from '../application/payment-reconciliation.service.js';
import { PaymentService } from '../application/payment.service.js';
import { CapturePaypalOrderDto, CreateReceiptUploadDto, InitiatePaymentDto, PaymentStatusLookupDto, SubmitManualProofDto } from './dto/payment.dto.js';

@ApiTags('shop/payments')
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(TenantScopeGuard)
@Controller('shop/payments')
export class PaymentController {
  constructor(
    private readonly payments: PaymentService,
    private readonly reconciliation: PaymentReconciliationService,
  ) {}

  @Get('manual-methods')
  @ApiOperation({ summary: 'List active manual payment methods.' })
  async listManualMethods(@CurrentTenant() tenantId: string) {
    return { data: await this.payments.listManualMethods(tenantId) };
  }

  @Get('gateway-status')
  @ApiOperation({ summary: 'Returns availability of each payment gateway.' })
  async gatewayStatus(@CurrentTenant() tenantId: string) {
    return { data: await this.payments.getGatewayStatus(tenantId) };
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment attempt.' })
  async initiate(
    @CurrentTenant() tenantId: string,
    @IdempotencyKey() idempotencyKey: string | undefined,
    @Body() dto: InitiatePaymentDto,
  ) {
    return { data: await this.payments.initiatePayment(tenantId, idempotencyKey, dto) };
  }

  @Post('paypal/capture')
  @ApiOperation({ summary: 'Capture an approved PayPal order through the backend.' })
  async capturePaypal(
    @CurrentTenant() tenantId: string,
    @IdempotencyKey() idempotencyKey: string | undefined,
    @Body() dto: CapturePaypalOrderDto,
  ) {
    return { data: await this.payments.capturePaypalOrder(tenantId, idempotencyKey, dto) };
  }

  @Post('receipt-upload')
  @RateLimit({ limit: 10, windowSeconds: 60, keyPrefix: 'payment-receipt-upload' })
  @UseGuards(RateLimitGuard, CsrfGuard, TenantScopeGuard)
  @ApiOperation({ summary: 'Create a signed receipt upload target.' })
  async receiptUpload(@CurrentTenant() tenantId: string, @Body() dto: CreateReceiptUploadDto) {
    return { data: await this.payments.createReceiptUpload(tenantId, dto) };
  }

  @Post('manual-proof')
  @RateLimit({ limit: 8, windowSeconds: 60, keyPrefix: 'payment-manual-proof' })
  @UseGuards(RateLimitGuard, CsrfGuard, TenantScopeGuard)
  @ApiOperation({ summary: 'Submit manual payment proof.' })
  async submitManualProof(
    @CurrentTenant() tenantId: string,
    @IdempotencyKey() idempotencyKey: string | undefined,
    @Body() dto: SubmitManualProofDto,
  ) {
    return { data: await this.payments.submitManualProof(tenantId, idempotencyKey, dto) };
  }

  @Post('status')
  @ApiOperation({ summary: 'Get backend-owned customer payment status.' })
  async getStatus(@CurrentTenant() tenantId: string, @Body() dto: PaymentStatusLookupDto) {
    return { data: await this.reconciliation.getCustomerPaymentStatus(tenantId, dto.orderId, dto) };
  }
}
