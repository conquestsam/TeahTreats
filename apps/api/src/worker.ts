import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerRuntimeModule } from './worker-runtime.module.js';

async function bootstrap() {
  await NestFactory.createApplicationContext(WorkerRuntimeModule, {
    logger: ['log', 'error', 'warn']
  });
  Logger.log('Snacks Commerce worker runtime started.', 'Worker');
}

void bootstrap();
