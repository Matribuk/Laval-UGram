import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { createMockCommentsService } from '../../../../test/mocks/services.mock';
import { createUserFactory, createCommentFactory } from '../../../../test/factories';
import { CreateCommentDto } from '../dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: ReturnType<typeof createMockCommentsService>;

  const user = createUserFactory();
  const imageId = 'image-uuid-123';

  beforeEach(async () => {
    commentsService = createMockCommentsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: commentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    jest.clearAllMocks();
  });

  describe('POST /images/:imageId/comments', () => {
    it('should add a comment and return the response DTO', async () => {
      const comment = createCommentFactory({ content: 'Great shot!', userId: user.id });
      commentsService.addComment.mockResolvedValue(comment);
      const dto: CreateCommentDto = { content: 'Great shot!' };

      const result = await controller.addComment(imageId, dto, user);

      expect(commentsService.addComment).toHaveBeenCalledWith(user.id, imageId, 'Great shot!');
      expect(result.content).toBe('Great shot!');
    });

    it('should throw NotFoundException when image does not exist', async () => {
      commentsService.addComment.mockRejectedValue(new NotFoundException());
      const dto: CreateCommentDto = { content: 'Hi' };

      await expect(controller.addComment(imageId, dto, user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /images/:imageId/comments/:commentId', () => {
    it('should delete the comment when user is the owner', async () => {
      commentsService.removeComment.mockResolvedValue(undefined);
      const commentId = 'comment-uuid-456';

      await controller.removeComment(imageId, commentId, user);

      expect(commentsService.removeComment).toHaveBeenCalledWith(user.id, commentId);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      commentsService.removeComment.mockRejectedValue(new NotFoundException());

      await expect(controller.removeComment(imageId, 'bad-id', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      commentsService.removeComment.mockRejectedValue(new ForbiddenException());

      await expect(controller.removeComment(imageId, 'comment-id', user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('GET /images/:imageId/comments', () => {
    it('should return paginated comments for an image', async () => {
      const comments = [createCommentFactory(), createCommentFactory()];
      commentsService.getCommentsByImage.mockResolvedValue({ comments, total: 2 });

      const result = await controller.getCommentsByImage(imageId, 1, 10);

      expect(commentsService.getCommentsByImage).toHaveBeenCalledWith(imageId, 1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should return empty list when no comments exist', async () => {
      commentsService.getCommentsByImage.mockResolvedValue({ comments: [], total: 0 });

      const result = await controller.getCommentsByImage(imageId, 1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should compute totalPages correctly', async () => {
      commentsService.getCommentsByImage.mockResolvedValue({ comments: [], total: 25 });

      const result = await controller.getCommentsByImage(imageId, 1, 10);

      expect(result.meta.totalPages).toBe(3);
    });
  });
});
