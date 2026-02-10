import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

export const createTestingApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
};

export const closeTestingApp = async (app: INestApplication): Promise<void> => {
  if (app) {
    await app.close();
  }
};

export const createTestingModule = async <T>(
  provider: any,
  mockProviders: Array<{ provide: any; useValue: any }> = [],
): Promise<TestingModule> => {
  return Test.createTestingModule({
    providers: [provider, ...mockProviders],
  }).compile();
};
