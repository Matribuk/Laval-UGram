import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(userId: string, imageId: string, content: string): Promise<Comment> {
    const comment = this.commentRepository.create({ userId, imageId, content });
    const saved = await this.commentRepository.save(comment);
    return this.findById(saved.id) as Promise<Comment>;
  }

  async findById(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async delete(id: string): Promise<void> {
    await this.commentRepository.delete({ id });
  }

  async findByImageId(
    imageId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Comment[], number]> {
    return this.commentRepository.findAndCount({
      where: { imageId },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' },
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Comment[], number]> {
    return this.commentRepository.findAndCount({
      where: { userId },
      relations: ['user', 'image', 'image.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
