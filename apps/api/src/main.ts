import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: parseCorsOrigins(config.get<string>('APP_CORS_ORIGIN')),
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const documentConfig = new DocumentBuilder()
    .setTitle('TeahTreats API')
    .setDescription(
      'REST API for the TeahTreats snacks e-commerce modular monolith. Protected browser mutations use HTTP-only cookies, tenant scoping, and CSRF headers.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'Admin/vendor access cookie set by /api/v1/auth/login.'
    })
    .addCookieAuth('customer_access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'customer_access_token',
      description: 'Customer access cookie set by /api/v1/customer-auth/login or signup.'
    })
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-tenant-id',
        description: 'Tenant context for tenant-scoped APIs.'
      },
      'tenant-id',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-csrf-token',
        description: 'CSRF token required for unsafe browser mutations.'
      },
      'csrf-token',
    )
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, documentConfig));

  await app.listen(config.get<number>('PORT') ?? 4000, config.get<string>('HOST') ?? '0.0.0.0');
}

void bootstrap();

function parseCorsOrigins(value: string | undefined) {
  const origins = (value ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.includes('*')) {
    return false;
  }
  return origins.length ? origins : ['http://localhost:3000'];
}
