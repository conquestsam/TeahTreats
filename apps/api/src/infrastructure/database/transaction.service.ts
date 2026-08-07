import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

type TransactionClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  run<TResult>(handler: (tx: TransactionClient) => Promise<TResult>) {
    return this.prisma.$transaction(handler);
  }
}
