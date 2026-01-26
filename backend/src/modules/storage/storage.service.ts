import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import type { IStorageProvider } from './interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = this.configService.get<number>('storage.maxFileSize', 5 * 1024 * 1024);
    this.allowedMimeTypes = this.configService.get<string[]>('storage.allowedMimeTypes', [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]);
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ filename: string; url: string }> {
    this.validateFile(file);

    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;

    await this.storageProvider.upload(file.buffer, filename, file.mimetype);

    return {
      filename,
      url: this.storageProvider.getUrl(filename),
    };
  }

  async deleteImage(filename: string): Promise<void> {
    await this.storageProvider.delete(filename);
  }

  getImageUrl(filename: string): string {
    return this.storageProvider.getUrl(filename);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }
}
