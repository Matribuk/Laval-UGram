import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { LikeStatusDto } from './dto';
import { Image } from '../images/entities/image.entity';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRepository) {}

  async addLike(userId: string, imageId: string): Promise<LikeStatusDto> {
    const alreadyLiked = await this.likesRepository.existsByUserAndImage(userId, imageId);
    if (alreadyLiked) {
      throw new ConflictException('You have already liked this image');
    }

    await this.likesRepository.create(userId, imageId);
    const likeCount = await this.likesRepository.countByImageId(imageId);

    return { likeCount, likedByCurrentUser: true };
  }

  async removeLike(userId: string, imageId: string): Promise<LikeStatusDto> {
    const liked = await this.likesRepository.existsByUserAndImage(userId, imageId);
    if (!liked) {
      throw new NotFoundException('You have not liked this image');
    }

    await this.likesRepository.delete(userId, imageId);
    const likeCount = await this.likesRepository.countByImageId(imageId);

    return { likeCount, likedByCurrentUser: false };
  }

  async getLikeStatus(userId: string, imageId: string): Promise<LikeStatusDto> {
    const [likeCount, likedByCurrentUser] = await Promise.all([
      this.likesRepository.countByImageId(imageId),
      this.likesRepository.existsByUserAndImage(userId, imageId),
    ]);

    return { likeCount, likedByCurrentUser };
  }

  async getLikedImages(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ images: Image[]; total: number }> {
    const [images, total] = await this.likesRepository.findLikedImagesByUserId(userId, page, limit);
    return { images, total };
  }
}
