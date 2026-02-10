import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('storage.s3.bucket', '');
    this.region = this.configService.get<string>('storage.s3.region', 'us-east-1');

    if (!this.bucket) {
      this.logger.warn('S3 bucket not configured. S3 storage will not work.');
    }
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('storage.s3.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>('storage.s3.secretAccessKey', ''),
      },
    });

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: file,
      ContentType: mimeType,
    });

    await client.send(command);
    return filename;
  }

  async delete(filename: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('storage.s3.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>('storage.s3.secretAccessKey', ''),
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filename,
    });

    await client.send(command);
  }

  getUrl(filename: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filename}`;
  }
}
