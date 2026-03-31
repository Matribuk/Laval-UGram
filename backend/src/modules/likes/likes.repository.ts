import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Image } from '../images/entities/image.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async create(userId: string, imageId: string): Promise<Like> {
    const like = this.likeRepository.create({ userId, imageId });
    return this.likeRepository.save(like);
  }

  async delete(userId: string, imageId: string): Promise<void> {
    await this.likeRepository.delete({ userId, imageId });
  }

  async countByImageId(imageId: string): Promise<number> {
    return this.likeRepository.count({ where: { imageId } });
  }

  async existsByUserAndImage(userId: string, imageId: string): Promise<boolean> {
    const count = await this.likeRepository.count({ where: { userId, imageId } });
    return count > 0;
  }

  async findLikedImagesByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Image[], number]> {
    const [likes, total] = await this.likeRepository.findAndCount({
      where: { userId },
      relations: ['image', 'image.user', 'image.hashtags', 'image.mentions', 'image.mentions.mentionedUser'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return [likes.map((like) => like.image), total];
  }
}
