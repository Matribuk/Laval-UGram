/**
 * Application configuration defaults.
 *
 * This file contains all configuration values for the application.
 * We use explicit defaults rather than
 * environment variables to simplify setup and collaboration.
 */

import * as dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = 8080;
export const DATABASE_CONFIG = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: parseInt(process.env.DB_PORT || '5433', 10),
  USERNAME: process.env.DB_USERNAME || 'ugram',
  PASSWORD: process.env.DB_PASSWORD || 'ugram_password',
  DATABASE: process.env.DB_DATABASE || 'ugram',
  SYNCHRONIZE: true,
  SSL: process.env.DB_SSL === 'true',
};

export const JWT_CONFIG = {
  SECRET: 'ugram-jwt-secret-key-for-school-project',
  EXPIRES_IN: '1d',
} as const;

export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/api/auth/google/callback',
};

export const STORAGE_CONFIG = {
  TYPE: 'local' as const,

  LOCAL: {
    UPLOAD_PATH: './uploads',
  },

  S3: {
    REGION: 'us-east-1',
    ACCESS_KEY_ID: '',
    SECRET_ACCESS_KEY: '',
    BUCKET: '',
  },

  MAX_FILE_SIZE: 5 * 1024 * 1024,

  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;
