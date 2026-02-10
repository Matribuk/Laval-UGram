export const createMockConfigService = (overrides: Record<string, unknown> = {}) => {
  const defaultConfig: Record<string, unknown> = {
    'jwt.secret': 'test-jwt-secret',
    'jwt.expiresIn': '1h',
    'storage.maxFileSize': 5 * 1024 * 1024,
    'storage.allowedMimeTypes': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'storage.local.uploadPath': './test-uploads',
    'storage.type': 'local',
    'storage.s3.bucket': 'test-bucket',
    'storage.s3.region': 'us-east-1',
    'storage.s3.accessKeyId': 'test-access-key',
    'storage.s3.secretAccessKey': 'test-secret-key',
    'database.host': 'localhost',
    'database.port': 5432,
    'database.username': 'test',
    'database.password': 'test',
    'database.name': 'test_db',
    ...overrides,
  };

  return {
    get: jest.fn(<T>(key: string, defaultValue?: T): T => {
      const value = defaultConfig[key];
      return (value !== undefined ? value : defaultValue) as T;
    }),
    getOrThrow: jest.fn(<T>(key: string): T => {
      const value = defaultConfig[key];
      if (value === undefined) {
        throw new Error(`Configuration key "${key}" does not exist`);
      }
      return value as T;
    }),
  };
};

export type MockConfigService = ReturnType<typeof createMockConfigService>;
