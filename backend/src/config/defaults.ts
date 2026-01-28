/**
 * Application configuration defaults.
 *
 * This file contains all configuration values for the application.
 * We use explicit defaults rather than
 * environment variables to simplify setup and collaboration.
 */

export const APP_PORT = 8080;
export const DATABASE_CONFIG = {
  HOST: 'localhost',
  PORT: 5433,
  USERNAME: 'ugram',
  PASSWORD: 'ugram_password',
  DATABASE: 'ugram',
  SYNCHRONIZE: true,
} as const;

export const JWT_CONFIG = {
  SECRET: 'ugram-jwt-secret-key-for-school-project',
  EXPIRES_IN: '1d',
} as const;

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

  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
} as const;
