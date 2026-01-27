import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let testUserCounter = 0;

  const createUniqueUser = () => {
    testUserCounter++;
    return {
      username: `testuser_e2e_${Date.now()}_${testUserCounter}`,
      email: `test_e2e_${Date.now()}_${testUserCounter}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register new user and return JWT token', async () => {
      const userData = createUniqueUser();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = createUniqueUser();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...userData,
          username: `different_${Date.now()}`,
        })
        .expect(409);
    });

    it('should return 409 for duplicate username', async () => {
      const userData = createUniqueUser();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...userData,
          email: `different_${Date.now()}@example.com`,
        })
        .expect(409);
    });

    it('should return 400 for invalid email format', async () => {
      const userData = createUniqueUser();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...userData,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 for password too short', async () => {
      const userData = createUniqueUser();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...userData,
          password: 'short',
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let registeredUser: { email: string; password: string };

    beforeAll(async () => {
      const userData = createUniqueUser();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);
      registeredUser = {
        email: userData.email,
        password: userData.password,
      };
    });

    it('should login existing user and return JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(registeredUser)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', registeredUser.email);
    });

    it('should return 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registeredUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        })
        .expect(401);
    });
  });

  describe('JWT Token Usage', () => {
    let validToken: string;

    beforeAll(async () => {
      const userData = createUniqueUser();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);
      validToken = response.body.accessToken;
    });

    it('should allow access to protected routes with valid token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('should return 401 for malformed token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 for missing Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should return 401 for Bearer without token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer ')
        .expect(401);
    });
  });
});
