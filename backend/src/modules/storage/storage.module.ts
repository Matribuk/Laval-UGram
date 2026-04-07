import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { ImageResizeService } from './image-resize.service';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ImageResizeService,
    StorageService,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const storageType = configService.get<string>('storage.type', 'local');

        if (storageType === 's3') {
          return new S3StorageProvider(configService);
        }

        return new LocalStorageProvider(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService, ImageResizeService],
})
export class StorageModule {}
