import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, CustomValidationPipe } from './common';

const DEFAULT_PORT = 8080;
const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  configureMiddleware(app);
  configureGlobalPipes(app);
  configureSwagger(app);

  const port = process.env.PORT ?? DEFAULT_PORT;
  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

function configureMiddleware(app: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never): void {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
}

function configureGlobalPipes(app: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never): void {
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
}

function configureSwagger(app: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never): void {
  const config = new DocumentBuilder()
    .setTitle('UGram API')
    .setDescription('Instagram-like application API for GLO-3112')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Images', 'Image management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

bootstrap().catch((err: Error) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
