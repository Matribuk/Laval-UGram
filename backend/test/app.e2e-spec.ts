import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 404 for unknown routes', () => {
    return request(app.getHttpServer())
      .get('/unknown-route')
      .expect(404);
  });

  it('should return 401 for protected routes without auth', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(401);
  });
});
