import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LikesController } from '../likes.controller';
import { LikesService } from '../likes.service';
import { createMockLikesService } from '../../../../test/mocks/services.mock';
import { createUserFactory } from '../../../../test/factories';

describe('LikesController', () => {
  let controller: LikesController;
  let likesService: ReturnType<typeof createMockLikesService>;

  const user = createUserFactory();
  const imageId = 'image-uuid-123';
  const likeStatus = { likeCount: 1, likedByCurrentUser: true };

  beforeEach(async () => {
    likesService = createMockLikesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [{ provide: LikesService, useValue: likesService }],
    }).compile();

    controller = module.get<LikesController>(LikesController);
    jest.clearAllMocks();
  });

  describe('POST /images/:imageId/likes', () => {
    it('should like an image and return like status', async () => {
      likesService.addLike.mockResolvedValue(likeStatus);

      const result = await controller.addLike(imageId, user);

      expect(likesService.addLike).toHaveBeenCalledWith(user.id, imageId);
      expect(result).toEqual(likeStatus);
    });

    it('should throw ConflictException when image is already liked', async () => {
      likesService.addLike.mockRejectedValue(new ConflictException());

      await expect(controller.addLike(imageId, user)).rejects.toThrow(ConflictException);
    });
  });

  describe('DELETE /images/:imageId/likes', () => {
    it('should unlike an image and return updated like status', async () => {
      const unlikedStatus = { likeCount: 0, likedByCurrentUser: false };
      likesService.removeLike.mockResolvedValue(unlikedStatus);

      const result = await controller.removeLike(imageId, user);

      expect(likesService.removeLike).toHaveBeenCalledWith(user.id, imageId);
      expect(result).toEqual(unlikedStatus);
    });

    it('should throw NotFoundException when like does not exist', async () => {
      likesService.removeLike.mockRejectedValue(new NotFoundException());

      await expect(controller.removeLike(imageId, user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /images/:imageId/likes', () => {
    it('should return like status for an image', async () => {
      likesService.getLikeStatus.mockResolvedValue(likeStatus);

      const result = await controller.getLikeStatus(imageId, user);

      expect(likesService.getLikeStatus).toHaveBeenCalledWith(user.id, imageId);
      expect(result).toEqual(likeStatus);
    });

    it('should return likedByCurrentUser false when user has not liked', async () => {
      const notLikedStatus = { likeCount: 5, likedByCurrentUser: false };
      likesService.getLikeStatus.mockResolvedValue(notLikedStatus);

      const result = await controller.getLikeStatus(imageId, user);

      expect(result.likedByCurrentUser).toBe(false);
      expect(result.likeCount).toBe(5);
    });
  });
});
