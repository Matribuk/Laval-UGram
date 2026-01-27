import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export interface AuthTokens {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const registerUser = async (
  app: INestApplication,
  userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  },
): Promise<AuthTokens> => {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);

  return {
    accessToken: response.body.accessToken,
    user: response.body.user,
  };
};

export const loginUser = async (
  app: INestApplication,
  credentials: {
    email: string;
    password: string;
  },
): Promise<AuthTokens> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(credentials)
    .expect(200);

  return {
    accessToken: response.body.accessToken,
    user: response.body.user,
  };
};

export const getAuthHeader = (token: string): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});

export const createAuthenticatedUser = async (
  app: INestApplication,
  suffix: string = Date.now().toString(),
): Promise<AuthTokens> => {
  return registerUser(app, {
    username: `testuser_${suffix}`,
    email: `test_${suffix}@example.com`,
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User',
  });
};
