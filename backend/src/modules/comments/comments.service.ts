import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { ImagesService } from '../images/images.service';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly imagesService: ImagesService,
  ) {}

  async addComment(userId: string, imageId: string, content: string): Promise<Comment> {
    await this.imagesService.findById(imageId);
    return this.commentsRepository.create(userId, imageId, content);
  }

  async removeComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.commentsRepository.delete(commentId);
  }

  async getCommentsByImage(
    imageId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: Comment[]; total: number }> {
    const [comments, total] = await this.commentsRepository.findByImageId(imageId, page, limit);
    return { comments, total };
  }

  async getCommentsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: Comment[]; total: number }> {
    const [comments, total] = await this.commentsRepository.findByUserId(userId, page, limit);
    return { comments, total };
  }
}
