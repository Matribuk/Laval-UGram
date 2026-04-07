import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export const IMAGE_SIZES = {
  thumbnail: 150,
  medium: 600,
} as const;

@Injectable()
export class ImageResizeService {
  async resize(buffer: Buffer, width: number): Promise<Buffer> {
    return sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .toBuffer();
  }

  async generateVariants(buffer: Buffer): Promise<{ thumbnail: Buffer; medium: Buffer }> {
    const [thumbnail, medium] = await Promise.all([
      this.resize(buffer, IMAGE_SIZES.thumbnail),
      this.resize(buffer, IMAGE_SIZES.medium),
    ]);
    return { thumbnail, medium };
  }
}
