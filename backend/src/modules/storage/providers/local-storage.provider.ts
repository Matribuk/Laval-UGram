import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('storage.local.uploadPath', './uploads');
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string, _mimeType: string): Promise<string> {
    const filePath = path.join(this.uploadPath, filename);
    await fs.writeFile(filePath, file);
    return filename;
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadPath, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
