import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Images (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let currentUserId: string;
  let testUserCounter = 0;

  const createUniqueUser = () => {
    testUserCounter++;
    return {
      username: `img_user_${Date.now()}_${testUserCounter}`,
      email: `img_user_${Date.now()}_${testUserCounter}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  };

  const createFakeImageBuffer = () => {
    const jpegHeader = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00,
    ]);
    return Buffer.concat([jpegHeader, Buffer.alloc(100)]);
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

  describe('POST /images', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/images')
        .expect(401);
    });

    it('should upload image with metadata', async () => {
      const response = await request(app.getHttpServer())
        .post('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', createFakeImageBuffer(), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('description', 'Test image description')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('description', 'Test image description');
    });

    it('should upload image with hashtags', async () => {
      const response = await request(app.getHttpServer())
        .post('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', createFakeImageBuffer(), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .field('description', 'Beautiful #nature #photo')
        .field('hashtags', 'nature,photo')
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /images', () => {
    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/images')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', createFakeImageBuffer(), {
            filename: `test${i}.jpg`,
            contentType: 'image/jpeg',
          })
          .field('description', `Test image ${i}`);
      }
    });

    it('should return paginated images', async () => {
      const response = await request(app.getHttpServer())
        .get('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include user in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('user');
      }
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/images')
        .expect(401);
    });
  });

  describe('GET /images/hashtag/:hashtag', () => {
    let imageWithHashtag: any;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', createFakeImageBuffer(), {
          filename: 'hashtag-test.jpg',
          contentType: 'image/jpeg',
        })
        .field('description', 'Testing hashtag search')
        .field('hashtags', 'uniquehashtag123');
      imageWithHashtag = response.body;
    });

    it('should filter images by hashtag', async () => {
      const response = await request(app.getHttpServer())
        .get('/images/hashtag/uniquehashtag123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty for non-existent hashtag', async () => {
      const response = await request(app.getHttpServer())
        .get('/images/hashtag/nonexistenthashtagxyz789')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /images/:id', () => {
    let createdImageId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', createFakeImageBuffer(), {
          filename: 'single.jpg',
          contentType: 'image/jpeg',
        })
        .field('description', 'Single image test');
      createdImageId = response.body.id;
    });

    it('should return image with all relations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/images/${createdImageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdImageId);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent image', async () => {
      await request(app.getHttpServer())
        .get('/images/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/images/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /images/:id', () => {
    let ownImageId: string;
    let otherUserToken: string;
    let otherUserId: string;

    beforeAll(async () => {
      const ownImageResponse = await request(app.getHttpServer())
        .post('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', createFakeImageBuffer(), {
          filename: 'own.jpg',
          contentType: 'image/jpeg',
        })
        .field('description', 'Own image');
      ownImageId = ownImageResponse.body.id;

      const otherUserData = createUniqueUser();
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUserData);
      otherUserToken = otherUserResponse.body.accessToken;
      otherUserId = otherUserResponse.body.user.id;
    });

    it('should update own image', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/images/${ownImageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should return 403 for other users image', async () => {
      await request(app.getHttpServer())
        .patch(`/images/${ownImageId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ description: 'Hacked' })
        .expect(403);
    });

    it('should update hashtags', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/images/${ownImageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hashtags: ['newtag1', 'newtag2'] })
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('DELETE /images/:id', () => {
    let imageToDeleteId: string;
    let otherUserToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', createFakeImageBuffer(), {
          filename: 'delete.jpg',
          contentType: 'image/jpeg',
        })
        .field('description', 'To be deleted');
      imageToDeleteId = response.body.id;

      const otherUserData = createUniqueUser();
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUserData);
      otherUserToken = otherUserResponse.body.accessToken;
    });

    it('should return 403 for other users image', async () => {
      await request(app.getHttpServer())
        .delete(`/images/${imageToDeleteId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should delete own image', async () => {
      await request(app.getHttpServer())
        .delete(`/images/${imageToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/images/${imageToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent image', async () => {
      await request(app.getHttpServer())
        .delete('/images/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
