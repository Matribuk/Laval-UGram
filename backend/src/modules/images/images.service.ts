import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ImagesRepository, ImageWithStats } from './images.repository';
import { StorageService } from '../storage/storage.service';
import { AnalyticsService } from '../monitoring/analytics.service';
import { CreateImageDto, UpdateImageDto } from './dto';
import { Image } from './entities';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ImagesService {
  constructor(
    private readonly imagesRepository: ImagesRepository,
    private readonly storageService: StorageService,
    private readonly analytics: AnalyticsService,
  ) {}

  async create(
    file: Express.Multer.File,
    createImageDto: CreateImageDto,
    user: User,
  ): Promise<Image> {
    const { url, thumbnailUrl, mediumUrl } =
      await this.storageService.uploadImage(file);

    const image = await this.imagesRepository.create({
      url,
      thumbnailUrl,
      mediumUrl,
      description: createImageDto.description,
      userId: user.id,
    });

    if (createImageDto.hashtags && createImageDto.hashtags.length > 0) {
      const hashtags = await this.imagesRepository.findOrCreateHashtags(
        createImageDto.hashtags,
      );
      await this.imagesRepository.updateImageHashtags(image.id, hashtags);
    }

    if (
      createImageDto.mentionedUserIds &&
      createImageDto.mentionedUserIds.length > 0
    ) {
      await this.imagesRepository.updateImageMentions(
        image.id,
        createImageDto.mentionedUserIds,
      );
    }

    this.analytics.trackPostCreated();
    if (
      createImageDto.appliedFilter &&
      createImageDto.appliedFilter !== 'normal'
    ) {
      this.analytics.trackFilterApplied();
    }

    return this.findById(image.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: Image[]; total: number }> {
    const [images, total] = await this.imagesRepository.findAll(page, limit);
    return { images, total };
  }

  async findById(id: string): Promise<Image> {
    const image = await this.imagesRepository.findById(id);
    if (!image) {
      throw new NotFoundException(`Image with ID "${id}" not found`);
    }
    return image;
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: Image[]; total: number }> {
    const [images, total] = await this.imagesRepository.findByUserId(
      userId,
      page,
      limit,
    );
    return { images, total };
  }

  async findByHashtag(
    hashtag: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: Image[]; total: number }> {
    const [images, total] = await this.imagesRepository.findByHashtag(
      hashtag,
      page,
      limit,
    );
    return { images, total };
  }

  async searchByDescription(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: Image[]; total: number }> {
    const [images, total] = await this.imagesRepository.searchByDescription(
      query,
      page,
      limit,
    );
    return { images, total };
  }

  async findAllWithStats(
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: ImageWithStats[]; total: number }> {
    const [images, total] = await this.imagesRepository.findAllWithStats(
      currentUserId,
      page,
      limit,
    );
    return { images, total };
  }

  async findByIdWithStats(
    id: string,
    currentUserId: string,
  ): Promise<ImageWithStats> {
    const image = await this.imagesRepository.findByIdWithStats(
      id,
      currentUserId,
    );
    if (!image) {
      throw new NotFoundException(`Image with ID "${id}" not found`);
    }
    return image;
  }

  async findByUserIdWithStats(
    userId: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: ImageWithStats[]; total: number }> {
    const [images, total] = await this.imagesRepository.findByUserIdWithStats(
      userId,
      currentUserId,
      page,
      limit,
    );
    return { images, total };
  }

  async findByHashtagWithStats(
    hashtag: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: ImageWithStats[]; total: number }> {
    const [images, total] = await this.imagesRepository.findByHashtagWithStats(
      hashtag,
      currentUserId,
      page,
      limit,
    );
    return { images, total };
  }

  async searchByDescriptionWithStats(
    query: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: ImageWithStats[]; total: number }> {
    const [images, total] =
      await this.imagesRepository.searchByDescriptionWithStats(
        query,
        currentUserId,
        page,
        limit,
      );
    return { images, total };
  }

  async update(
    id: string,
    updateImageDto: UpdateImageDto,
    currentUser: User,
  ): Promise<Image> {
    const image = await this.findById(id);

    if (image.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own images');
    }

    if (updateImageDto.description !== undefined) {
      await this.imagesRepository.update(id, {
        description: updateImageDto.description,
      });
    }

    if (updateImageDto.hashtags !== undefined) {
      const hashtags = await this.imagesRepository.findOrCreateHashtags(
        updateImageDto.hashtags,
      );
      await this.imagesRepository.updateImageHashtags(id, hashtags);
    }

    if (updateImageDto.mentionedUserIds !== undefined) {
      await this.imagesRepository.updateImageMentions(
        id,
        updateImageDto.mentionedUserIds,
      );
    }

    return this.findById(id);
  }

  async delete(id: string, currentUser: User): Promise<void> {
    const image = await this.findById(id);

    if (image.userId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own images');
    }

    const filename = await this.imagesRepository.getImageFilename(id);
    if (filename) {
      await this.storageService.deleteImage(filename);
    }

    const deleted = await this.imagesRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Image with ID "${id}" not found`);
    }
  }
}
