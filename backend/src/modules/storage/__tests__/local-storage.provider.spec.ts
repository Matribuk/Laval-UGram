import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocalStorageProvider } from '../providers/local-storage.provider';
import { createMockConfigService } from '../../../../test/mocks/config.mock';

jest.mock('fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

import * as fs from 'fs/promises';

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;
  let configService: ReturnType<typeof createMockConfigService>;

  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    configService = createMockConfigService({
      'storage.local.uploadPath': './test-uploads',
    });

    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.unlink.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStorageProvider,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    provider = module.get<LocalStorageProvider>(LocalStorageProvider);
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should write file to configured upload path', async () => {
      
      const buffer = Buffer.from('test-image-data');
      const filename = 'test-image.jpg';
      const mimeType = 'image/jpeg';

      
      await provider.upload(buffer, filename, mimeType);

      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(filename),
        buffer,
      );
    });

    it('should return filename on success', async () => {
      
      const buffer = Buffer.from('data');
      const filename = 'uploaded.jpg';

      
      const result = await provider.upload(buffer, filename, 'image/jpeg');

      
      expect(result).toBe(filename);
    });

    it('should join upload path with filename', async () => {
      
      const buffer = Buffer.from('data');
      const filename = 'image.jpg';

      
      await provider.upload(buffer, filename, 'image/jpeg');

      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test-uploads.*image\.jpg/),
        buffer,
      );
    });
  });

  describe('delete', () => {
    it('should remove file from filesystem', async () => {
      
      const filename = 'file-to-delete.jpg';

      
      await provider.delete(filename);

      
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining(filename),
      );
    });

    it('should ignore ENOENT errors (file not found)', async () => {
      
      const enoentError = new Error('File not found') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      mockFs.unlink.mockRejectedValue(enoentError);

      
      await expect(provider.delete('non-existent.jpg')).resolves.not.toThrow();
    });

    it('should throw other filesystem errors', async () => {
      
      const permissionError = new Error('Permission denied') as NodeJS.ErrnoException;
      permissionError.code = 'EACCES';
      mockFs.unlink.mockRejectedValue(permissionError);

      
      await expect(provider.delete('file.jpg')).rejects.toThrow('Permission denied');
    });
  });

  describe('getUrl', () => {
    it('should return url with /uploads/ prefix', () => {
      
      const filename = 'image.jpg';

      
      const result = provider.getUrl(filename);

      
      expect(result).toBe('/uploads/image.jpg');
    });

    it('should handle filenames with special characters', () => {
      
      const filename = 'image-123_test.jpg';

      
      const result = provider.getUrl(filename);

      
      expect(result).toBe('/uploads/image-123_test.jpg');
    });
  });

  describe('ensureUploadDirectory', () => {
    it('should create directory if not exists', async () => {
      
      const accessError = new Error('Directory not found');
      mockFs.access.mockRejectedValueOnce(accessError);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocalStorageProvider,
          { provide: ConfigService, useValue: configService },
        ],
      }).compile();

      module.get<LocalStorageProvider>(LocalStorageProvider);

      
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true },
      );
    });

    it('should not throw if directory exists', async () => {
      mockFs.access.mockResolvedValue(undefined);

      
      await expect(
        Test.createTestingModule({
          providers: [
            LocalStorageProvider,
            { provide: ConfigService, useValue: configService },
          ],
        }).compile(),
      ).resolves.not.toThrow();
    });
  });
});
