import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';
import { STORAGE_PROVIDER } from '../interfaces/storage-provider.interface';
import {
  createMockFile,
  createLargeFile,
  createInvalidTypeFile,
} from '../../../../test/factories/image.factory';
import {
  createMockStorageProvider,
} from '../../../../test/mocks/services.mock';
import { createMockConfigService } from '../../../../test/mocks/config.mock';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('StorageService', () => {
  let service: StorageService;
  let storageProvider: ReturnType<typeof createMockStorageProvider>;
  let configService: ReturnType<typeof createMockConfigService>;

  beforeEach(async () => {
    storageProvider = createMockStorageProvider();
    configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: STORAGE_PROVIDER, useValue: storageProvider },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should validate file before upload', async () => {
      
      const file = createMockFile();
      storageProvider.upload.mockResolvedValue('filename.jpg');
      storageProvider.getUrl.mockReturnValue('/uploads/filename.jpg');

      
      await service.uploadImage(file);

      expect(storageProvider.upload).toHaveBeenCalled();
    });

    it('should generate UUID filename', async () => {
      
      const file = createMockFile({ originalname: 'original.jpg' });
      storageProvider.upload.mockResolvedValue('mock-uuid.jpg');

      
      const result = await service.uploadImage(file);

      
      expect(result.filename).toBe('mock-uuid.jpg');
    });

    it('should preserve original file extension', async () => {
      
      const pngFile = createMockFile({ originalname: 'image.png', mimetype: 'image/png' });
      storageProvider.upload.mockResolvedValue('mock-uuid.png');

      
      await service.uploadImage(pngFile);

      
      expect(storageProvider.upload).toHaveBeenCalledWith(
        pngFile.buffer,
        'mock-uuid.png',
        'image/png',
      );
    });

    it('should delegate to storage provider', async () => {
      
      const file = createMockFile();
      storageProvider.upload.mockResolvedValue('mock-uuid.jpg');

      
      await service.uploadImage(file);

      
      expect(storageProvider.upload).toHaveBeenCalledWith(
        file.buffer,
        'mock-uuid.jpg',
        file.mimetype,
      );
    });

    it('should return filename and url', async () => {
      
      const file = createMockFile();
      storageProvider.upload.mockResolvedValue('mock-uuid.jpg');
      storageProvider.getUrl.mockReturnValue('/uploads/mock-uuid.jpg');

      
      const result = await service.uploadImage(file);

      
      expect(result).toEqual({
        filename: 'mock-uuid.jpg',
        url: '/uploads/mock-uuid.jpg',
      });
    });
  });

  describe('validateFile', () => {
    it('should throw BadRequestException when file is null', async () => {
      
      await expect(service.uploadImage(null as any)).rejects.toThrow(BadRequestException);
      await expect(service.uploadImage(null as any)).rejects.toThrow('Image file is required');
    });

    it('should throw BadRequestException when file is undefined', async () => {
      
      await expect(service.uploadImage(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file exceeds max size', async () => {
      
      const largeFile = createLargeFile();

      
      await expect(service.uploadImage(largeFile)).rejects.toThrow(BadRequestException);
      await expect(service.uploadImage(largeFile)).rejects.toThrow(
        /File size exceeds maximum allowed size/,
      );
    });

    it('should throw BadRequestException for disallowed MIME type', async () => {
      
      const invalidFile = createInvalidTypeFile();

      
      await expect(service.uploadImage(invalidFile)).rejects.toThrow(BadRequestException);
      await expect(service.uploadImage(invalidFile)).rejects.toThrow(
        /File type application\/pdf is not allowed/,
      );
    });

    it('should accept image/jpeg', async () => {
      
      const jpegFile = createMockFile({ mimetype: 'image/jpeg' });

      
      await expect(service.uploadImage(jpegFile)).resolves.not.toThrow();
    });

    it('should accept image/png', async () => {
      
      const pngFile = createMockFile({ mimetype: 'image/png', originalname: 'test.png' });

      
      await expect(service.uploadImage(pngFile)).resolves.not.toThrow();
    });

    it('should accept image/gif', async () => {
      
      const gifFile = createMockFile({ mimetype: 'image/gif', originalname: 'test.gif' });

      
      await expect(service.uploadImage(gifFile)).resolves.not.toThrow();
    });

    it('should accept image/webp', async () => {
      
      const webpFile = createMockFile({ mimetype: 'image/webp', originalname: 'test.webp' });

      
      await expect(service.uploadImage(webpFile)).resolves.not.toThrow();
    });

    it('should reject non-image file types', async () => {
      
      const textFile = createMockFile({
        mimetype: 'text/plain',
        originalname: 'file.txt',
      });

      
      await expect(service.uploadImage(textFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteImage', () => {
    it('should delegate to storage provider', async () => {
      
      const filename = 'image-to-delete.jpg';

      
      await service.deleteImage(filename);

      
      expect(storageProvider.delete).toHaveBeenCalledWith(filename);
    });

    it('should not throw when file does not exist', async () => {
      
      storageProvider.delete.mockResolvedValue(undefined);

      
      await expect(service.deleteImage('non-existent.jpg')).resolves.not.toThrow();
    });
  });

  describe('getImageUrl', () => {
    it('should delegate to storage provider', () => {
      
      const filename = 'image.jpg';
      storageProvider.getUrl.mockReturnValue('/uploads/image.jpg');

      
      const result = service.getImageUrl(filename);

      
      expect(result).toBe('/uploads/image.jpg');
      expect(storageProvider.getUrl).toHaveBeenCalledWith(filename);
    });
  });
});
