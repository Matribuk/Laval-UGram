import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let currentUserId: string;
  let testUserCounter = 0;

  const createUniqueUser = () => {
    testUserCounter++;
    return {
      username: `user_e2e_${Date.now()}_${testUserCounter}`,
      email: `user_e2e_${Date.now()}_${testUserCounter}@example.com`,
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

    const userData = createUniqueUser();
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData);
    authToken = response.body.accessToken;
    currentUserId = response.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should respect page and limit params', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/search', () => {
    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        const userData = {
          username: `searchable_user_${Date.now()}_${i}`,
          email: `searchable_${Date.now()}_${i}@example.com`,
          password: 'SecurePassword123!',
          firstName: 'Searchable',
          lastName: 'User',
        };
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData);
      }
    });

    it('should search users by username', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search?q=searchable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search?q=nonexistentuser12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should return paginated results with meta', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search?q=user&page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
    });
  });

  describe('GET /users/me', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
    });

    it('should exclude password hash', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', currentUserId);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update own profile', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(response.body).toHaveProperty('firstName', 'Updated');
    });

    it('should return 403 when updating other user', async () => {

      const otherUserData = createUniqueUser();
      const otherResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUserData);
      const otherUserId = otherResponse.body.user.id;

      await request(app.getHttpServer())
        .patch(`/users/${otherUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Hacked' })
        .expect(403);
    });

    it('should return 409 for duplicate email', async () => {

      const otherUserData = createUniqueUser();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUserData);

      await request(app.getHttpServer())
        .patch(`/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: otherUserData.email })
        .expect(409);
    });
  });

  describe('POST /users/:id/profile-picture', () => {
    it('should return 403 for other users', async () => {
      const otherUserData = createUniqueUser();
      const otherResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUserData);
      const otherUserId = otherResponse.body.user.id;

      await request(app.getHttpServer())
        .post(`/users/${otherUserId}/profile-picture`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from('fake-image'), 'test.jpg')
        .expect(403);
    });
  });
});
