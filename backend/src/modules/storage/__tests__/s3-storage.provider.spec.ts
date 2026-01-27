import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3StorageProvider } from '../providers/s3-storage.provider';
import { createMockConfigService } from '../../../../test/mocks/config.mock';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => params),
}));

describe('S3StorageProvider', () => {
  let provider: S3StorageProvider;

  beforeEach(async () => {
    const configService = createMockConfigService({
      'storage.s3.bucket': 'test-bucket',
      'storage.s3.region': 'us-west-2',
      'storage.s3.accessKeyId': 'test-access-key',
      'storage.s3.secretAccessKey': 'test-secret-key',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageProvider,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    provider = module.get<S3StorageProvider>(S3StorageProvider);
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should return the uploaded filename', async () => {
      const buffer = Buffer.from('test-file-content');
      const filename = 'test-image.jpg';

      const result = await provider.upload(buffer, filename, 'image/jpeg');

      expect(result).toBe(filename);
    });
  });

  describe('delete', () => {
    it('should complete without throwing', async () => {
      await expect(provider.delete('file-to-delete.jpg')).resolves.not.toThrow();
    });
  });

  describe('getUrl', () => {
    it('should return a valid S3 URL with bucket, region, and filename', () => {
      const result = provider.getUrl('image.jpg');

      expect(result).toBe('https://test-bucket.s3.us-west-2.amazonaws.com/image.jpg');
    });

    it('should preserve special characters in filename', () => {
      const result = provider.getUrl('image-123_test.jpg');

      expect(result).toBe('https://test-bucket.s3.us-west-2.amazonaws.com/image-123_test.jpg');
    });
  });
});
