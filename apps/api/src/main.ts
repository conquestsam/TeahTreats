import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

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

  const documentConfig = new DocumentBuilder()
    .setTitle('Snacks Commerce API')
    .setDescription('REST API for the snacks e-commerce modular monolith.')
    .setVersion('1.0')
    .addCookieAuth('access_token')
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
