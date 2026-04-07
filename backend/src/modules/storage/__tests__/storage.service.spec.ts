import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';
import { ImageResizeService } from '../image-resize.service';
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

const createMockImageResizeService = () => ({
  resize: jest.fn(),
  generateVariants: jest.fn().mockResolvedValue({
    thumbnail: Buffer.from('thumbnail'),
    medium: Buffer.from('medium'),
  }),
});

describe('StorageService', () => {
  let service: StorageService;
  let storageProvider: ReturnType<typeof createMockStorageProvider>;
  let configService: ReturnType<typeof createMockConfigService>;
  let imageResizeService: ReturnType<typeof createMockImageResizeService>;

  beforeEach(async () => {
    storageProvider = createMockStorageProvider();
    configService = createMockConfigService();
    imageResizeService = createMockImageResizeService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: STORAGE_PROVIDER, useValue: storageProvider },
        { provide: ConfigService, useValue: configService },
        { provide: ImageResizeService, useValue: imageResizeService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    jest.clearAllMocks();
    imageResizeService.generateVariants.mockResolvedValue({
      thumbnail: Buffer.from('thumbnail'),
      medium: Buffer.from('medium'),
    });
  });

  describe('uploadImage', () => {
    it('should validate file before upload', async () => {
      const file = createMockFile();
      storageProvider.upload.mockResolvedValue('filename.jpg');
      storageProvider.getUrl.mockReturnValue('/uploads/filename.jpg');

      await service.uploadImage(file);

      expect(storageProvider.upload).toHaveBeenCalled();
    });

    it('should generate UUID filename for the original', async () => {
      const file = createMockFile({ originalname: 'original.jpg' });
      storageProvider.upload.mockResolvedValue('mock-uuid.jpg');
      storageProvider.getUrl.mockReturnValue('/uploads/mock-uuid.jpg');

      const result = await service.uploadImage(file);

      expect(result.filename).toBe('mock-uuid.jpg');
    });

    it('should upload original, medium and thumbnail variants', async () => {
      const file = createMockFile({ originalname: 'original.jpg' });
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.jpg');

      await service.uploadImage(file);

      expect(storageProvider.upload).toHaveBeenCalledTimes(3);
      const uploadedFilenames = storageProvider.upload.mock.calls.map((c) => c[1]);
      expect(uploadedFilenames).toContain('mock-uuid.jpg');
      expect(uploadedFilenames).toContain('mock-uuid_medium.jpg');
      expect(uploadedFilenames).toContain('mock-uuid_thumbnail.jpg');
    });

    it('should return url, thumbnailUrl and mediumUrl', async () => {
      const file = createMockFile({ originalname: 'image.jpg' });
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockImplementation((name: string) => `/uploads/${name}`);

      const result = await service.uploadImage(file);

      expect(result.url).toBe('/uploads/mock-uuid.jpg');
      expect(result.thumbnailUrl).toBe('/uploads/mock-uuid_thumbnail.jpg');
      expect(result.mediumUrl).toBe('/uploads/mock-uuid_medium.jpg');
    });

    it('should preserve original file extension for all variants', async () => {
      const pngFile = createMockFile({ originalname: 'image.png', mimetype: 'image/png' });
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.png');

      await service.uploadImage(pngFile);

      const uploadedFilenames = storageProvider.upload.mock.calls.map((c) => c[1]);
      expect(uploadedFilenames).toContain('mock-uuid.png');
      expect(uploadedFilenames).toContain('mock-uuid_medium.png');
      expect(uploadedFilenames).toContain('mock-uuid_thumbnail.png');
    });

    it('should delegate variant generation to ImageResizeService', async () => {
      const file = createMockFile();
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.jpg');

      await service.uploadImage(file);

      expect(imageResizeService.generateVariants).toHaveBeenCalledWith(file.buffer);
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
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.jpg');

      await expect(service.uploadImage(jpegFile)).resolves.not.toThrow();
    });

    it('should accept image/png', async () => {
      const pngFile = createMockFile({ mimetype: 'image/png', originalname: 'test.png' });
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.png');

      await expect(service.uploadImage(pngFile)).resolves.not.toThrow();
    });

    it('should accept image/gif', async () => {
      const gifFile = createMockFile({ mimetype: 'image/gif', originalname: 'test.gif' });
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.gif');

      await expect(service.uploadImage(gifFile)).resolves.not.toThrow();
    });

    it('should accept image/webp', async () => {
      const webpFile = createMockFile({ mimetype: 'image/webp', originalname: 'test.webp' });
      storageProvider.upload.mockResolvedValue(undefined);
      storageProvider.getUrl.mockReturnValue('/uploads/mock.webp');

      await expect(service.uploadImage(webpFile)).resolves.not.toThrow();
    });

    it('should reject non-image file types', async () => {
      const textFile = createMockFile({ mimetype: 'text/plain', originalname: 'file.txt' });

      await expect(service.uploadImage(textFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteImage', () => {
    it('should delete original, medium and thumbnail variants', async () => {
      storageProvider.delete.mockResolvedValue(undefined);

      await service.deleteImage('image.jpg');

      expect(storageProvider.delete).toHaveBeenCalledTimes(3);
      expect(storageProvider.delete).toHaveBeenCalledWith('image.jpg');
      expect(storageProvider.delete).toHaveBeenCalledWith('image_medium.jpg');
      expect(storageProvider.delete).toHaveBeenCalledWith('image_thumbnail.jpg');
    });

    it('should handle filenames without extension', async () => {
      storageProvider.delete.mockResolvedValue(undefined);

      await service.deleteImage('imagefile');

      expect(storageProvider.delete).toHaveBeenCalledWith('imagefile');
      expect(storageProvider.delete).toHaveBeenCalledWith('imagefile_medium');
      expect(storageProvider.delete).toHaveBeenCalledWith('imagefile_thumbnail');
    });

    it('should not throw when variant files do not exist', async () => {
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
