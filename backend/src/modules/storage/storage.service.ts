import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import type { IStorageProvider } from './interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { ImageResizeService } from './image-resize.service';

export interface UploadResult {
  filename: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
}

@Injectable()
export class StorageService {
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly configService: ConfigService,
    private readonly imageResizeService: ImageResizeService,
  ) {
    this.maxFileSize = this.configService.get<number>('storage.maxFileSize', 5 * 1024 * 1024);
    this.allowedMimeTypes = this.configService.get<string[]>('storage.allowedMimeTypes', [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]);
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);

    const extension = path.extname(file.originalname);
    const uuid = uuidv4();
    const filename = `${uuid}${extension}`;
    const mediumFilename = `${uuid}_medium${extension}`;
    const thumbnailFilename = `${uuid}_thumbnail${extension}`;

    const { thumbnail, medium } = await this.imageResizeService.generateVariants(file.buffer);

    await Promise.all([
      this.storageProvider.upload(file.buffer, filename, file.mimetype),
      this.storageProvider.upload(medium, mediumFilename, file.mimetype),
      this.storageProvider.upload(thumbnail, thumbnailFilename, file.mimetype),
    ]);

    return {
      filename,
      url: this.storageProvider.getUrl(filename),
      thumbnailUrl: this.storageProvider.getUrl(thumbnailFilename),
      mediumUrl: this.storageProvider.getUrl(mediumFilename),
    };
  }

  async deleteImage(filename: string): Promise<void> {
    const { medium, thumbnail } = this.getVariantFilenames(filename);
    await Promise.all([
      this.storageProvider.delete(filename),
      this.storageProvider.delete(medium),
      this.storageProvider.delete(thumbnail),
    ]);
  }

  getImageUrl(filename: string): string {
    return this.storageProvider.getUrl(filename);
  }

  private getVariantFilenames(filename: string): { medium: string; thumbnail: string } {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) {
      return { medium: `${filename}_medium`, thumbnail: `${filename}_thumbnail` };
    }
    const base = filename.substring(0, lastDot);
    const ext = filename.substring(lastDot);
    return { medium: `${base}_medium${ext}`, thumbnail: `${base}_thumbnail${ext}` };
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
